type AvatarProps = {
  name: string;
  image?: string | null;
  size?: number;
  className?: string;
};

// Matches DESIGN.md avatar treatment: circle, falls back to the user's
// initial on a warm terracotta-tinted surface when `image` is absent.
function Avatar({ name, image, size = 96, className = "" }: AvatarProps) {
  const style = { width: size, height: size };
  if (image) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt={name}
        style={style}
        className={`rounded-full border-2 border-linen-border object-cover ${className}`}
      />
    );
  }
  return (
    <div
      style={style}
      className={`flex items-center justify-center rounded-full border-2 border-linen-border bg-primary-fixed font-display text-2xl font-semibold text-on-primary-fixed ${className}`}
    >
      {name.charAt(0).toUpperCase()}
    </div>
  );
}

export default Avatar;
