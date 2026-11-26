import React from 'react';
import { chaptersFromGroup, parseVideoSource, urlFromField } from '@components/media/media-utils';
import { getBunnyChapters } from '@/utils/bunny';
import { StudyCardView } from './StudyCardView';

import type { JSX } from 'react';

/**
 * Props for `MediaStudyCard`.
 */
export type MediaStudyCardProps = {
  slice: any;
  index?: number;
  slices?: readonly any[] | any[];
  context?: any;
};

/**
 * Component for "MediaStudyCard" Slices: a lesson card with a video (chapter tabs),
 * a play-along audio track (chapters, waveform, tempo) and a practice tab.
 * Video chapters come from the CMS, or automatically from Bunny Stream.
 */
const MediaStudyCard = async ({ slice, context }: MediaStudyCardProps): Promise<JSX.Element> => {
  const primary = (slice?.primary || {}) as any;

  const video = parseVideoSource(urlFromField(primary.video));
  let videoChapters = chaptersFromGroup(primary.video_chapters);
  if (videoChapters.length === 0 && video?.provider === 'bunny' && primary.use_bunny_chapters !== false) {
    videoChapters = await getBunnyChapters(video.libraryId, video.id);
  }

  const audioUrl = urlFromField(primary.audio_file);
  const audioChapters = chaptersFromGroup(primary.audio_chapters);

  return (
    <StudyCardView
      sliceType={slice.slice_type}
      variation={slice.variation}
      primary={primary}
      video={video}
      videoChapters={videoChapters}
      audioUrl={audioUrl}
      audioChapters={audioChapters}
      inPost={!!context?.inPost}
    />
  );
};

export default MediaStudyCard;
