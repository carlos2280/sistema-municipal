import { DynamicIcon, type IconName } from 'lucide-react/dynamic';

export const getIconLucile = (name?: IconName) => {
  if (!name) return null;

  return <DynamicIcon name={name} size={24} strokeWidth={1.5} />;
};
