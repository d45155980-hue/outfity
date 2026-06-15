'use client';

interface LoaderProps {
  fullPage?: boolean;
  text?: string;
}

export default function Loader({ fullPage = true, text }: LoaderProps) {
  const content = (
    <div className="flex flex-col items-center justify-center gap-4">
      <div className="w-10 h-10 border-2 border-gray-200 border-t-black rounded-full animate-spin" />
      {text && <p className="text-sm text-gray-500">{text}</p>}
    </div>
  );

  if (fullPage) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-white">
        {content}
      </div>
    );
  }

  return <div className="flex items-center justify-center py-20">{content}</div>;
}
