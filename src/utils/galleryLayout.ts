const LAYOUT_PATTERNS = [
  { span: 'col-span-1 row-span-1', shape: 'rounded-[2rem_5rem_2rem_5rem]' },
  { span: 'col-span-2 row-span-2', shape: 'rounded-[4rem_2rem_6rem_3rem]' },
  { span: 'col-span-1 row-span-1', shape: 'rounded-[5rem_2rem_4rem_6rem]' },
  { span: 'col-span-2 row-span-1', shape: 'rounded-[2rem_6rem_3rem_5rem]' },
  { span: 'col-span-1 row-span-2', shape: 'rounded-[6rem_3rem_5rem_2rem]' },
  { span: 'col-span-1 row-span-1', shape: 'rounded-[3rem_5rem_2rem_6rem]' },
  { span: 'col-span-1 row-span-1', shape: 'rounded-[4rem_2rem_3rem_5rem]' },
  { span: 'col-span-1 row-span-1', shape: 'rounded-[2rem_5rem_4rem_2rem]' },
  { span: 'col-span-2 row-span-1', shape: 'rounded-[5rem_2rem_6rem_4rem]' },
  { span: 'col-span-1 row-span-1', shape: 'rounded-[3rem_6rem_2rem_4rem]' },
  { span: 'col-span-1 row-span-1', shape: 'rounded-[6rem_2rem_5rem_3rem]' },
  { span: 'col-span-2 row-span-1', shape: 'rounded-[2rem_4rem_6rem_5rem]' },
];

export function getGalleryLayout(index: number) {
  return LAYOUT_PATTERNS[index % LAYOUT_PATTERNS.length];
}
