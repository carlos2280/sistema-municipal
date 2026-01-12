import { useMenu } from '../../hook/useMenu';
import RecursiveMenu from './RecursiveMenu';

interface Props {
  collapsed: boolean;
}
const MainMenu = ({ collapsed = false }: Props) => {
  const { menu, nombreSistema } = useMenu();
  return (
    <div>
      <RecursiveMenu
        items={menu}
        nombreSistema={nombreSistema}
        collapsed={!collapsed}
      />
    </div>
  );
};

export default MainMenu;
