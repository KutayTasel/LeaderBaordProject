"use client";
import { Footer } from "flowbite-react";

const FooterComponent = () => {
  return (
    <Footer
      container={true}
      className="bg-gray-800 text-white py-6 border-t border-gray-600"
    >
      <div className="w-full max-w-screen-md mx-auto flex flex-col sm:flex-row gap-4 sm:gap-20 justify-center sm:justify-between items-center px-4">
        <Footer.Copyright
          href="#"
          by="Panteon Games"
          year={2024}
          className="text-center sm:text-left"
        />
        <Footer.LinkGroup className="flex flex-col sm:flex-row gap-2 sm:gap-8 text-center sm:text-left">
          <Footer.Link href="#">About</Footer.Link>
          <Footer.Link href="#">Privacy Policy</Footer.Link>
          <Footer.Link href="#">Contact</Footer.Link>
        </Footer.LinkGroup>
      </div>
    </Footer>
  );
};

export default FooterComponent;
