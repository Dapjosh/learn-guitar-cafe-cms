import React from "react";
import * as prismic from "@prismicio/client";
import { isFilled } from "@prismicio/client";
import { PrismicRichText } from "@prismicio/react";
import { PrismicNextImage, PrismicNextLink } from "@prismicio/next";
import {
  resolveHeadingTypography,
  resolveBodyTypography,
  resolveFontFamily,
  cn,
} from "@lgc_cms/util";
import { createClient } from "@/prismicio";
import { BadgePill, CmsButton } from "../ContentImageSlice/shared";

import type { JSX } from "react";

// Pull category name and author name through the content relationships
const FETCH_LINKS = ["blog_category.category", "author.name"];

type Post = prismic.PrismicDocument<Record<string, any>>;

const DEFAULT_COUNT = 4;

// Shown only in development (e.g. the Slice Machine simulator) when there are no posts,
// so editors can preview the layout before any Blog Posts are published.
const samplePost = (id: string, title: string, category: string): Post =>
  ({
    id,
    uid: id,
    url: "/blog",
    type: "blog_post",
    data: {
      title,
      category: { data: { category } },
      author: { data: { name: "Paul Greig" } },
      feature_image: {},
      publishing_date: null,
    },
  }) as unknown as Post;

const samplePosts: Post[] = [
  samplePost("sample-1", "A smoother slide sound in open D", "Slide guitar"),
  samplePost("sample-2", "Three blues licks for your next jam", "Blues guitar"),
  samplePost("sample-3", "Build a relaxed fingerstyle groove", "Fingerstyle"),
  samplePost("sample-4", "Getting a warmer guitar tone at home", "Tone tips"),
];

/**
 * Hand-picked articles (in the editor's order) when any are selected,
 * otherwise the latest posts, optionally filtered by category.
 */
async function getPosts(primary: any): Promise<Post[]> {
  const client = createClient();
  const count =
    typeof primary.number_of_articles === "number" &&
    primary.number_of_articles > 0
      ? Math.min(Math.round(primary.number_of_articles), 12)
      : DEFAULT_COUNT;

  const pickedIds: string[] = (
    Array.isArray(primary.articles) ? primary.articles : []
  )
    .map((a: any) =>
      isFilled.contentRelationship(a?.article) ? a.article.id : null,
    )
    .filter(Boolean);

  try {
    if (pickedIds.length > 0) {
      const res = await client.getByIDs(pickedIds, {
        fetchLinks: FETCH_LINKS,
        pageSize: 100,
      });
      const byId = new Map(res.results.map((d) => [d.id, d]));
      return pickedIds.map((id) => byId.get(id)).filter(Boolean) as Post[];
    }

    const filters = isFilled.contentRelationship(primary.category_filter)
      ? [prismic.filter.at("my.blog_post.category", primary.category_filter.id)]
      : [];

    const res = await client.getByType("blog_post", {
      pageSize: count,
      fetchLinks: FETCH_LINKS,
      filters,
      orderings: [
        { field: "my.blog_post.publishing_date", direction: "desc" },
        { field: "document.first_publication_date", direction: "desc" },
      ],
    });
    return res.results as Post[];
  } catch (error) {
    console.error("[BlogList/featuredGrid] Failed to fetch blog posts", error);
    return [];
  }
}

const formatDate = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  return Number.isNaN(date.getTime())
    ? ""
    : date.toLocaleDateString("en-GB", {
        day: "numeric",
        month: "short",
        year: "numeric",
      });
};

/**
 * "Featured Grid" variation of BlogList: header with badge, title and
 * "view all" button; one large featured article beside a stack of smaller ones.
 */
export const FeaturedArticles = async ({
  slice,
}: {
  slice: any;
}): Promise<JSX.Element | null> => {
  const primary = (slice?.primary || {}) as any;
  const posts = await getPosts(primary);
  const isDev = process.env.NODE_ENV !== "production";
  // No posts: hide the section for visitors, preview sample articles in development
  if (posts.length === 0 && !isDev) return null;
  const items = posts.length > 0 ? posts : samplePosts;

  // ---- Display options ----
  const showCategory = primary.show_category !== false;
  const showAuthor = primary.show_author !== false;
  const showDate = primary.show_date === true;
  const authorPrefix = primary.author_prefix ?? "By";
  const featuredOnRight = primary.featured_position === "Right";

  // ---- Colours ----
  const sectionBg = primary.section_bg_color || "#f3efe6";
  const cardBg = primary.card_bg_color || "#fbf9f5";
  const cardBorder = primary.card_border_color || "transparent";
  const imageBorder = primary.image_border_color || "#1c1917";
  const categoryColor = primary.category_color || "#d85d18";
  const articleTitleColor = primary.article_title_color || "#1c1917";
  const metaColor = primary.meta_color || "#78716c";

  // ---- Typography ----
  const headingTypo = resolveHeadingTypography({
    size: primary.title_size,
    font: primary.title_font,
    weight: primary.title_weight,
    color: primary.title_color,
    fallbackFont: "Bebas Neue",
    fallbackSize: "Large",
    fallbackColor: "#1c1917",
  });
  const headingClass = cn(
    headingTypo.className,
    "uppercase tracking-tight leading-[1.05]",
  );
  const bodyTypo = resolveBodyTypography({
    size: primary.description_size,
    font: primary.description_font,
    color: primary.description_color,
    fallbackFont: "Inter Tight",
    fallbackColor: "#57534e",
  });
  const articleFont = resolveFontFamily(
    primary.article_title_font,
    "Inter Tight",
  );

  // ---- Button ----
  const btnBg = primary.button_background_color || "transparent";
  const btnText = primary.button_text_color || "#1c1917";

  const [featured, ...rest] = items;

  const renderMeta = (post: Post, size: "lg" | "sm") => {
    const data = post.data || {};
    const category = data.category?.data?.category;
    const author = data.author?.data?.name;
    const date = showDate ? formatDate(data.publishing_date) : "";
    const metaLine = [
      showAuthor && author ? `${authorPrefix} ${author}`.trim() : "",
      date,
    ]
      .filter(Boolean)
      .join(" · ");

    return (
      <div className="flex flex-col min-w-0">
        {showCategory && category && (
          <span
            className="text-xs sm:text-sm mb-2 sm:mb-3"
            style={{ color: categoryColor }}
          >
            {category}
          </span>
        )}
        <h3
          className={cn(
            articleFont.className,
            "tracking-[-0.02em] leading-[1.2] transition-colors group-hover:underline underline-offset-4 decoration-1",
            size === "lg"
              ? "text-xl sm:text-2xl"
              : "text-lg sm:text-xl lg:text-[1.375rem]",
          )}
          style={{
            fontFamily: articleFont.fontFamily,
            color: articleTitleColor,
          }}
        >
          {data.title || "Untitled article"}
        </h3>
        {metaLine && (
          <span className="text-sm mt-3 sm:mt-4" style={{ color: metaColor }}>
            {metaLine}
          </span>
        )}
      </div>
    );
  };

  const renderImage = (post: Post, sizes: string) =>
    isFilled.image(post.data?.feature_image) ? (
      <PrismicNextImage
        field={post.data.feature_image}
        fill
        sizes={sizes}
        className="object-cover object-center transition-transform duration-500 group-hover:scale-[1.03]"
      />
    ) : (
      <span
        className="absolute inset-0"
        style={{ backgroundColor: "#e7dfd2" }}
        aria-hidden="true"
      />
    );

  const cardClass =
    "group block rounded-[12px] border transition-shadow duration-300 hover:shadow-[0_8px_24px_-12px_rgba(28,25,23,0.18)] focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  const cardStyle = { backgroundColor: cardBg, borderColor: cardBorder };

  return (
    <section
      data-slice-type={slice.slice_type}
      data-slice-variation={slice.variation}
      className="w-full px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:py-24 font-sans"
      style={{ backgroundColor: sectionBg }}
    >
      <div className="max-w-[1380px] mx-auto">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-10 lg:mb-12">
          <div className="max-w-3xl">
            <BadgePill
              text={primary.badge_text || "Guitar journal"}
              icon={primary.badge_icon}
              bg={primary.badge_bg_color || "#ffffff"}
              textColor={primary.badge_text_color || "#d85d18"}
              iconColor={primary.badge_icon_color}
              borderColor={primary.badge_border_color}
              className="mb-5"
            />
            {isFilled.richText(primary.title) ? (
              <PrismicRichText
                field={primary.title}
                components={{
                  heading1: ({ children }: any) => (
                    <h1 className={headingClass} style={headingTypo.style}>
                      {children}
                    </h1>
                  ),
                  heading2: ({ children }: any) => (
                    <h2 className={headingClass} style={headingTypo.style}>
                      {children}
                    </h2>
                  ),
                }}
              />
            ) : (
              <h2 className={headingClass} style={headingTypo.style}>
                From the Cafe notebook
              </h2>
            )}
            {isFilled.richText(primary.description) && (
              <div
                className={cn(
                  bodyTypo.className,
                  "leading-relaxed mt-4 max-w-2xl [&_p]:mb-3 [&_p:last-child]:mb-0",
                )}
                style={bodyTypo.style}
              >
                <PrismicRichText field={primary.description} />
              </div>
            )}
          </div>

          {primary.show_button !== false && (
            <div className="shrink-0">
              <CmsButton
                label={primary.button_label ?? "View all articles"}
                link={
                  isFilled.link(primary.button_link)
                    ? primary.button_link
                    : { link_type: "Web", url: "/blog" }
                }
                font={primary.button_font}
                radius={primary.button_radius}
                bg={btnBg}
                textColor={btnText}
                borderColor={primary.button_border_color || btnText}
                hoverBg={primary.button_hover_background_color || "#1c1917"}
                hoverText={primary.button_hover_text_color || "#ffffff"}
                showArrow={primary.button_show_arrow !== false}
              />
            </div>
          )}
        </div>

        {items.length === 0 ? null : (
          <div
            className={cn(
              "grid grid-cols-1 gap-6",
              rest.length > 0 && "lg:grid-cols-2",
            )}
          >
            {/* Featured article */}
            <PrismicNextLink
              document={featured}
              className={cn(
                cardClass,
                "p-3 sm:p-4 flex flex-col",
                featuredOnRight && "lg:order-2",
              )}
              style={cardStyle}
            >
              <span
                className="relative block w-full aspect-[16/9] lg:aspect-[16/10] rounded-[6px] overflow-hidden border"
                style={{ borderColor: imageBorder }}
              >
                {renderImage(featured, "(max-width: 1024px) 100vw, 50vw")}
              </span>
              <div className="px-1 sm:px-2 pt-6 pb-2 sm:pt-8 sm:pb-3">
                {renderMeta(featured, "lg")}
              </div>
            </PrismicNextLink>

            {/* Smaller articles */}
            {rest.length > 0 && (
              <div
                className={cn(
                  "flex flex-col gap-6",
                  featuredOnRight && "lg:order-1",
                )}
              >
                {rest.map((post) => (
                  <PrismicNextLink
                    key={post.id}
                    document={post}
                    className={cn(
                      cardClass,
                      "p-2 flex items-center gap-4 sm:gap-6 lg:flex-1",
                    )}
                    style={cardStyle}
                  >
                    <span
                      className="relative block shrink-0 w-[38%] max-w-[200px] aspect-[4/3] rounded-[6px] overflow-hidden border"
                      style={{ borderColor: imageBorder }}
                    >
                      {renderImage(post, "200px")}
                    </span>
                    <div className="py-2 pr-2 sm:pr-4 min-w-0">
                      {renderMeta(post, "sm")}
                    </div>
                  </PrismicNextLink>
                ))}
              </div>
            )}
          </div>
        )}
      </div>
    </section>
  );
};

export default FeaturedArticles;
