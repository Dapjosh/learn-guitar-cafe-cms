"use client";

import { FC, useState } from 'react';
import { Content, isFilled } from '@prismicio/client';
import { PrismicRichText } from '@prismicio/react';
import { PrismicNextImage, PrismicNextLink } from '@prismicio/next';
import { SliceComponentProps } from '@prismicio/react';

/**
 * Props for `CourseGrid`.
 */
export type CourseGridProps = SliceComponentProps<Content.CourseGridSlice>;

/**
 * Component for "CourseGrid" Slices.
 */
const CourseGrid: FC<CourseGridProps> = ({ slice }) => {
  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const courses = slice.primary.courses || [];

  // Extract unique categories from content relationship
  const categories = Array.from(
    new Set(
      courses
        .map((item: any) => {
          if (
            isFilled.contentRelationship(item.course_category) &&
            (item.course_category as any).data?.name
          ) {
            return (item.course_category as any).data.name;
          }
          return null;
        })
        .filter(Boolean)
    )
  ) as string[];

  const filteredCourses =
    selectedCategory === 'All'
      ? courses
      : courses.filter((item: any) => {
        if (
          isFilled.contentRelationship(item.course_category) &&
          (item.course_category as any).data?.name
        ) {
          return (item.course_category as any).data.name === selectedCategory;
        }
        return false;
      });

  return (
    // <section
    //   data-slice-type={slice.slice_type}
    //   data-slice-variation={slice.variation}
    // >
    //   Placeholder component for course_grid (variation: {slice.variation})
    //   slices.
    //   <br />
    //   <strong>You can edit this slice directly in your code editor.</strong>
    //   {/**
    //    * 💡 Use your own AI agent with the Prismic CLI
    //    * 📚 Docs: https://prismic.io/docs/ai#create-slices
    //    */}
    // </section>

    <section className="py-16 px-4 md:px-8 max-w-7xl mx-auto font-sans">
      <div className="flex flex-col md:flex-row justify-between items-end mb-10 gap-4">
        {/* Section Header */}
        <div>
          <div className="text-3xl font-bold text-gray-900 mb-2">
            <PrismicRichText field={slice.primary.section_title} />
          </div>
          <div className="text-gray-500">
            <PrismicRichText field={slice.primary.section_description} />
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
          {/* Category Filter */}
          {categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mr-4">
              <button
                onClick={() => setSelectedCategory('All')}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === 'All'
                    ? 'bg-gray-900 text-white'
                    : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
              >
                All
              </button>
              {categories.map((category, index) => (
                <button
                  key={index}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${selectedCategory === category
                      ? 'bg-gray-900 text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                    }`}
                >
                  {category}
                </button>
              ))}
            </div>
          )}

          {isFilled.link(slice.primary.all_courses_link) && (
            <PrismicNextLink
              field={slice.primary.all_courses_link}
              className="border border-gray-300 rounded-full px-6 py-2 text-sm font-medium hover:bg-gray-50 transition-colors whitespace-nowrap"
            >
              {slice.primary.button_text || 'All Courses'}
            </PrismicNextLink>
          )}
        </div>
      </div>

      {/* Course Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {filteredCourses.map((courseItem: any, index: number) => {
          const isFree = courseItem.current_price === "0" || courseItem.current_price?.toLowerCase() === "free";

          // Parse prices to compare
          const currentPriceNum = parseFloat(courseItem.current_price?.replace(/[^0-9.]/g, '') || "0");
          const originalPriceNum = parseFloat(courseItem.original_price?.replace(/[^0-9.]/g, '') || "0");
          const hasDiscount = originalPriceNum > currentPriceNum;

          return (
            <div
              key={index}
              className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-[0_4px_20px_rgb(0,0,0,0.05)] flex flex-col hover:shadow-[0_4px_25px_rgb(0,0,0,0.1)] transition-shadow"
            >
              <div className="relative h-full w-full bg-blue-50">
                <PrismicNextImage
                  field={courseItem.course_image}
                  className="w-full h-full object-cover"
                  fallbackAlt=""
                />
                {isFilled.contentRelationship(courseItem.course_category) && (courseItem.course_category as any).data?.name && (
                  <span className="absolute top-4 left-4 bg-black text-white text-xs font-semibold px-3 py-1.5 rounded-md">
                    {(courseItem.course_category as any).data.name}
                  </span>
                )}
              </div>

              <div className="p-6 flex flex-col flex-grow">
                {/* Author */}
                <p className="text-sm text-gray-500 mb-2">
                  by{' '}
                  <span className="text-gray-900 font-medium">
                    {courseItem.instructor}
                  </span>
                </p>

                {/* Title */}
                <div className="text-xl font-bold text-gray-900 mb-4 line-clamp-2 min-h-[3.5rem]">
                  <PrismicRichText field={courseItem.course_title} />
                </div>

                {/* Meta Information (Duration & Students) */}
                <div className="flex items-center gap-6 text-sm text-gray-500 font-medium mb-4">
                  <div className="flex items-center gap-1.5">
                    {/* Clock SVG Icon */}
                    <svg
                      className="w-4 h-4 text-orange-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    {courseItem.duration}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {/* Graduation Cap SVG Icon */}
                    <svg
                      className="w-4 h-4 text-orange-500"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path d="M10.394 2.08a1 1 0 00-.788 0l-7 3a1 1 0 000 1.84L5.25 8.051a.999.999 0 01.356-.257l4-1.714a1 1 0 11.788 1.838L7.667 9.088l1.94.831a1 1 0 00.787 0l7-3a1 1 0 000-1.838l-7-3zM3.31 9.397L5 10.12v4.102a8.969 8.969 0 00-1.05-.174 1 1 0 01-.89-.89 11.115 11.115 0 01.25-3.762zM9.3 16.573A9.026 9.026 0 007 14.935v-3.957l1.818.78a3 3 0 002.364 0l5.508-2.361a11.026 11.026 0 01.25 3.762 1 1 0 01-.89.89 8.968 8.968 0 00-5.35 2.524 1 1 0 01-1.4 0zM6 18a1 1 0 001-1v-2.065a8.935 8.935 0 00-2-.712V17a1 1 0 001 1z" />
                    </svg>
                    {courseItem.students_count} Students
                  </div>
                </div>

                {/* Divider */}
                <hr className="border-gray-100 my-2" />

                {/* Footer (Pricing & Link) */}
                <div className="flex justify-between items-center mt-auto pt-2">
                  <div className="font-bold">
                    {isFree ? (
                      <div className="flex items-center gap-2">
                        {hasDiscount && (
                          <span className="text-gray-400 line-through text-sm">
                            ${courseItem.original_price}
                          </span>
                        )}
                        <span className="text-green-500">Free</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        {hasDiscount && (
                          <span className="text-gray-400 line-through text-sm">
                            ${courseItem.original_price}
                          </span>
                        )}
                        <span className="text-red-500">
                          ${courseItem.current_price}
                        </span>
                      </div>
                    )}
                  </div>

                  <PrismicNextLink
                    field={courseItem.cta_link}
                    className="text-sm font-bold text-gray-900 hover:text-orange-500 transition-colors"
                  >
                    View More
                  </PrismicNextLink>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
};

export default CourseGrid;
