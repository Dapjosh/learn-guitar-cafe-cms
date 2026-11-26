import React from 'react';
import { InstructorIntro } from './InstructorIntro';
import { StoryColumns } from './StoryColumns';

import type { JSX } from 'react';

/**
 * Props for `MyStory`.
 */
export type MyStoryProps = {
  slice: any;
  index?: number;
  slices?: readonly any[] | any[];
  context?: any;
};

/**
 * Component for "MyStory" Slices:
 * - "instructor": circular portrait with rings and a vinyl record, name, role, bio and buttons
 * - "story": title with buttons, story text on the left, numbered highlights on the right
 */
const MyStory = ({ slice }: MyStoryProps): JSX.Element =>
  slice.variation === 'story' ? <StoryColumns slice={slice} /> : <InstructorIntro slice={slice} />;

export default MyStory;
