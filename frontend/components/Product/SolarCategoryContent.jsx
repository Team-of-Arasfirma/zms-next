import { solarCategoryContent } from "@/data/solarCategoryContent";

// Server Component: the entire article is present without JavaScript or expansion.
export default function SolarCategoryContent() {
  const sections = [];
  for (const block of solarCategoryContent) {
    if (block.type === "li") {
      const previous = sections.at(-1);
      if (previous?.type === "ul") previous.items.push(block.text);
      else sections.push({ type: "ul", items: [block.text] });
    } else sections.push(block);
  }

  return (
    <article
      aria-labelledby="solar-content-title"
      className="mt-16 min-w-0 border-t border-gray-200 pt-10 sm:mt-20 sm:pt-14"
    >
      <div className="mx-auto max-w-4xl break-words text-base leading-8 text-gray-600">
        {sections.map((block, index) => {
          if (block.type === "title") {
            return (
              <header key={index} className="mb-8 border-l-4 border-[#ff6b2c] pl-5 sm:pl-7">
                <h2 id="solar-content-title" className="text-3xl font-semibold leading-tight text-[#1d2b3a] sm:text-4xl">
                  {block.text}
                </h2>
              </header>
            );
          }
          if (block.type === "h2") {
            return <h2 key={index} className="mb-5 mt-12 border-b border-orange-100 pb-4 text-2xl font-semibold leading-snug text-[#1d2b3a] sm:text-3xl">{block.text}</h2>;
          }
          if (block.type === "h3") {
            return <h3 key={index} className="mb-3 mt-8 text-xl font-semibold leading-relaxed text-[#1d2b3a]">{block.text}</h3>;
          }
          if (block.type === "ul") {
            return (
              <ul key={index} className="my-6 list-disc space-y-4 rounded-2xl border border-gray-100 bg-gray-50 py-6 pl-10 pr-5 marker:text-[#ff6b2c] sm:pl-12 sm:pr-8">
                {block.items.map((text, itemIndex) => <li key={itemIndex} className="pl-1">{text}</li>)}
              </ul>
            );
          }
          return <p key={index} className="mb-5">{block.text}</p>;
        })}
      </div>
    </article>
  );
}
