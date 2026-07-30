'use client';

import { forwardRef, useImperativeHandle, useMemo, useRef } from 'react';
import type { ForwardedRef } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { LexicalErrorBoundary } from '@lexical/react/LexicalErrorBoundary';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { OnChangePlugin } from '@lexical/react/LexicalOnChangePlugin';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import {
  $applyNodeReplacement,
  $createParagraphNode,
  $createTextNode,
  $getRoot,
  $getSelection,
  $isElementNode,
  $isLineBreakNode,
  $isRangeSelection,
  $isTextNode,
  addClassNamesToElement,
  type EditorConfig,
  type EditorState,
  type LexicalNode,
  type LexicalUpdateJSON,
  type NodeKey,
  type SerializedTextNode,
  type Spread,
  TextNode,
} from 'lexical';
import {
  canonicalizeGuestMessageVariableKey,
  normalizeGuestMessageTemplate,
  type GuestMessageVariableOption,
} from '@/utils/guestMessageVariables';

export interface GuestTemplateEditorHandle {
  insertVariable: (variableKey: string) => void;
}

interface GuestTemplateEditorProps {
  value: string;
  variableOptions: GuestMessageVariableOption[];
  onChange: (value: string) => void;
  onDirty?: () => void;
  maxLength: number;
}

type SerializedGuestVariableNode = Spread<{
  label: string;
  variableKey: string;
}, SerializedTextNode>;

class GuestVariableNode extends TextNode {
  __variableKey: string;
  __label: string;

  $config() {
    return this.config('guest-template-variable', { extends: TextNode });
  }

  static clone(node: GuestVariableNode): GuestVariableNode {
    return new GuestVariableNode(node.__variableKey, node.__label, node.__key);
  }

  static importJSON(serializedNode: SerializedGuestVariableNode): GuestVariableNode {
    return $createGuestVariableNode(serializedNode.variableKey, serializedNode.label).updateFromJSON(serializedNode);
  }

  constructor(variableKey = '', label = variableKey, key?: NodeKey) {
    super(label, key);
    this.__variableKey = canonicalizeGuestMessageVariableKey(variableKey);
    this.__label = label;
  }

  afterCloneFrom(prevNode: this): void {
    super.afterCloneFrom(prevNode);
    this.__variableKey = prevNode.__variableKey;
    this.__label = prevNode.__label;
  }

  createDOM(config: EditorConfig): HTMLElement {
    const element = super.createDOM(config);
    addClassNamesToElement(
      element,
      'inline-flex',
      'items-center',
      'rounded-full',
      'bg-gold/10',
      'px-2.5',
      'py-1',
      'text-[10px]',
      'font-bold',
      'leading-none',
      'text-gold',
      'align-middle',
    );
    element.setAttribute('data-variable-key', this.getVariableKey());
    element.setAttribute('contenteditable', 'false');
    return element;
  }

  updateDOM(prevNode: this, dom: HTMLElement, config: EditorConfig): boolean {
    const shouldReplace = super.updateDOM(prevNode, dom, config);
    dom.setAttribute('data-variable-key', this.getVariableKey());
    return shouldReplace;
  }

  exportJSON(): SerializedGuestVariableNode {
    return {
      ...super.exportJSON(),
      label: this.getLabel(),
      variableKey: this.getVariableKey(),
    };
  }

  getVariableKey() {
    return this.getLatest().__variableKey;
  }

  getLabel() {
    return this.getLatest().__label;
  }

  canInsertTextBefore(): false {
    return false;
  }

  canInsertTextAfter(): false {
    return false;
  }

  isTextEntity(): true {
    return true;
  }
}

function $createGuestVariableNode(variableKey: string, label: string): GuestVariableNode {
  return $applyNodeReplacement(
    new GuestVariableNode(canonicalizeGuestMessageVariableKey(variableKey), label)
      .setMode('token')
      .toggleUnmergeable(),
  );
}

function $isGuestVariableNode(node: LexicalNode | null | undefined): node is GuestVariableNode {
  return node instanceof GuestVariableNode;
}

function buildOptionMap(options: GuestMessageVariableOption[]) {
  return new Map(options.map(option => [canonicalizeGuestMessageVariableKey(option.key), option]));
}

function appendTemplateText(parent: ReturnType<typeof $createParagraphNode>, text: string, options: Map<string, GuestMessageVariableOption>) {
  const tokenPattern = /\{([^{}]+)\}/g;
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = tokenPattern.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parent.append($createTextNode(text.slice(lastIndex, match.index)));
    }

    const canonicalKey = canonicalizeGuestMessageVariableKey(match[1]);
    const option = options.get(canonicalKey);
    parent.append(option ? $createGuestVariableNode(option.key, option.label) : $createTextNode(match[0]));
    lastIndex = tokenPattern.lastIndex;
  }

  if (lastIndex < text.length) {
    parent.append($createTextNode(text.slice(lastIndex)));
  }
}

function initializeTemplateEditor(value: string, options: GuestMessageVariableOption[]) {
  const root = $getRoot();
  const optionMap = buildOptionMap(options);
  const lines = value.split('\n');

  root.clear();
  for (const line of lines.length > 0 ? lines : ['']) {
    const paragraph = $createParagraphNode();
    appendTemplateText(paragraph, line, optionMap);
    root.append(paragraph);
  }
}

function serializeNode(node: LexicalNode): string {
  if ($isGuestVariableNode(node)) return `{${node.getVariableKey()}}`;
  if ($isTextNode(node)) return node.getTextContent();
  if ($isLineBreakNode(node)) return '\n';
  if ($isElementNode(node)) return node.getChildren().map(serializeNode).join('');
  return '';
}

function serializeTemplateEditorState() {
  return $getRoot().getChildren().map(serializeNode).join('\n');
}

function getVariableLabel(variableKey: string, options: Map<string, GuestMessageVariableOption>) {
  const canonicalKey = canonicalizeGuestMessageVariableKey(variableKey);
  return options.get(canonicalKey)?.label ?? canonicalKey;
}

function TemplateEditorBridge({
  maxLength,
  onChange,
  onDirty,
  value,
  variableOptions,
  editorRef,
}: {
  maxLength: number;
  onChange: (value: string) => void;
  onDirty?: () => void;
  variableOptions: GuestMessageVariableOption[];
  value: string;
  editorRef: ForwardedRef<GuestTemplateEditorHandle>;
}) {
  const [editor] = useLexicalComposerContext();
  const optionMap = useMemo(() => buildOptionMap(variableOptions), [variableOptions]);
  const lastSerializedValueRef = useRef(normalizeGuestMessageTemplate(value).slice(0, maxLength));

  useImperativeHandle(editorRef, () => ({
    insertVariable(variableKey: string) {
      const canonicalKey = canonicalizeGuestMessageVariableKey(variableKey);
      const label = getVariableLabel(canonicalKey, optionMap);

      editor.update(() => {
        const selection = $getSelection();
        if (!$isRangeSelection(selection)) {
          const root = $getRoot();
          const lastChild = root.getLastChild();
          const target = $isElementNode(lastChild) ? lastChild : $createParagraphNode();
          if (lastChild == null || !$isElementNode(lastChild)) root.append(target);
          target.append($createGuestVariableNode(canonicalKey, label), $createTextNode(' '));
          return;
        }

        selection.insertNodes([$createGuestVariableNode(canonicalKey, label)]);
        selection.insertText(' ');
      });
    },
  }), [editor, optionMap]);

  return (
    <OnChangePlugin
      ignoreSelectionChange
      onChange={(editorState: EditorState) => {
        editorState.read(() => {
          const nextValue = normalizeGuestMessageTemplate(serializeTemplateEditorState()).slice(0, maxLength);
          const changed = nextValue !== lastSerializedValueRef.current;
          lastSerializedValueRef.current = nextValue;
          onChange(nextValue);
          if (changed) {
            onDirty?.();
          }
        });
      }}
    />
  );
}

export const GuestTemplateEditor = forwardRef<GuestTemplateEditorHandle, GuestTemplateEditorProps>(
  function GuestTemplateEditor({ value, variableOptions, onChange, onDirty, maxLength }, ref) {
    const initialConfig = useMemo(() => ({
      namespace: 'GuestTemplateEditor',
      nodes: [GuestVariableNode],
      onError(error: Error) {
        throw error;
      },
      editorState: () => initializeTemplateEditor(value, variableOptions),
    }), [value, variableOptions]);

    return (
      <LexicalComposer initialConfig={initialConfig}>
        <RichTextPlugin
          contentEditable={(
            <ContentEditable
              aria-label="Template pesan undangan"
              role="textbox"
              spellCheck={false}
              className="min-h-[240px] w-full resize-y overflow-auto whitespace-pre-wrap break-words rounded-xl border border-gold/20 bg-white px-3 py-2.5 font-mono text-xs leading-relaxed text-ink caret-ink outline-none transition-colors focus:border-gold/50"
            />
          )}
          placeholder={null}
          ErrorBoundary={LexicalErrorBoundary}
        />
        <HistoryPlugin />
        <TemplateEditorBridge
          maxLength={maxLength}
          onChange={onChange}
          onDirty={onDirty}
          value={value}
          variableOptions={variableOptions}
          editorRef={ref}
        />
      </LexicalComposer>
    );
  },
);
