"use client";

import { extractVkVideoId, extractYouTubeId } from "@/lib/utils";
import type { VideoType } from "@/lib/types";

interface VideoPlayerProps {
  videoUrl: string | null;
  videoType: VideoType;
  title: string;
}

export function VideoPlayer({ videoUrl, videoType, title }: VideoPlayerProps) {
  if (!videoUrl || videoType === "none") {
    return (
      <div className="aspect-video rounded-2xl glass flex items-center justify-center">
        <p className="text-muted-foreground">Видео не добавлено</p>
      </div>
    );
  }

  if (videoType === "youtube") {
    const videoId = extractYouTubeId(videoUrl);
    if (!videoId) {
      return <div className="aspect-video rounded-2xl glass flex items-center justify-center text-muted-foreground">Некорректная ссылка YouTube</div>;
    }
    return (
      <div className="aspect-video rounded-2xl overflow-hidden glass">
        <iframe
          src={`https://www.youtube.com/embed/${videoId}`}
          title={title}
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  if (videoType === "vk") {
    const vk = extractVkVideoId(videoUrl);
    if (!vk) {
      return <div className="aspect-video rounded-2xl glass flex items-center justify-center text-muted-foreground">Некорректная ссылка VK Video</div>;
    }
    return (
      <div className="aspect-video rounded-2xl overflow-hidden glass">
        <iframe
          src={`https://vk.com/video_ext.php?oid=${vk.oid}&id=${vk.id}&hd=2`}
          title={title}
          allow="autoplay; encrypted-media; fullscreen; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
        />
      </div>
    );
  }

  return null;
}
