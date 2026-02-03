export const ProjectAvatar = ({
  title,
}: {
  title: string;
}) => {
  
  return (
    <div
      className="w-6 h-6 rounded flex items-center justify-center bg-yellow-500">
      <span className="text-xs font-medium text-white">
        {title.charAt(0).toUpperCase()}
      </span>
    </div>
  );
};