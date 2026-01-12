import * as TbIcons from 'react-icons/tb';

export const getIcon = (iconName?: string) => {
  if (!iconName) return null;
  const IconComponent = TbIcons[iconName as keyof typeof TbIcons];
  return IconComponent ? <IconComponent size={24} /> : null;
};
