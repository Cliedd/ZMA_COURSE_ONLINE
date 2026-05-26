import { Bell } from "lucide-react";

export const NotificationBadge = ({ count }: { count: number }) => (
  <div className="relative cursor-pointer">
    <Bell className="w-6 h-6 text-primary" />
    {count > 0 && (
      <span className="absolute -top-1 -right-1 bg-secondary text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
        {count}
      </span>
    )}
  </div>
);
