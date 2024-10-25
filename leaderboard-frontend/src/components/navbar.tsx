import { Navbar } from "flowbite-react";
import { MenuOutlined } from "@ant-design/icons";

interface NavbarComponentProps {
  toggleSidebar: () => void;
}

const NavbarComponent: React.FC<NavbarComponentProps> = ({ toggleSidebar }) => {
  return (
    <Navbar
      fluid
      rounded
      className="bg-gray-900 text-white py-4 fixed w-full top-0 shadow-md z-50"
    >
      <div className="flex justify-center items-center w-full px-4 relative">
        <button
          onClick={toggleSidebar}
          className="absolute left-4 text-white focus:outline-none"
        >
          <MenuOutlined style={{ fontSize: "24px" }} />
        </button>
        <Navbar.Brand href="/" className="flex justify-center">
          <img
            src="https://www.panteon.games/wp-content/themes/panteon/assets/img/logo.png"
            className="h-10"
            alt="Panteon Logo"
          />
        </Navbar.Brand>
      </div>
    </Navbar>
  );
};

export default NavbarComponent;
