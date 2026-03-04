interface SplineEmbedProps {
  sceneUrl: string;
}

export function SplineEmbed({ sceneUrl }: SplineEmbedProps) {
  return (
    <div className="glass-surface h-full w-full overflow-hidden">
      <iframe
        src={sceneUrl}
        title="CS Signature Celebrations 3D scene"
        className="h-full w-full border-0"
        allow="autoplay; fullscreen"
      />
    </div>
  );
}

