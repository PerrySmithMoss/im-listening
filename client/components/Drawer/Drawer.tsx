import React from "react";

interface DrawerProps {
  children: React.ReactNode;
  isOpen: boolean;
  setIsOpen: (state: boolean) => void;
  title: string;
  size?: "sm" | "md" | "lg";
}

export const Drawer: React.FC<DrawerProps> = ({
  children,
  isOpen,
  setIsOpen,
  title,
  size,
}) => {
  return (
    <div
      className={
        `fixed overflow-hidden z-50 inset-0 transform ease-in-out ${
          size && "bg-gray-900 bg-opacity-25"
        }` +
        (isOpen
          ? " transition-opacity opacity-100 duration-500 translate-x-0"
          : " transition-all delay-500 opacity-0 translate-x-full")
      }
    >
      <section
        className={
          `w-screen right-0 absolute bg-white h-full shadow-xl delay-400 duration-500 ease-in-out transition-all transform ${
            !size
              ? "max-w-[370px]"
              : size === "sm"
              ? "max-w-[370px]"
              : size === "md"
              ? "max-w-[570px]"
              : "max-w-[770px]"
          }` + (isOpen ? " translate-x-0 " : " translate-x-full ")
        }
      >
        <div
          className={`relative w-screen pb-10 flex flex-col space-y-6 overflow-y-auto h-full ${
            !size
              ? "max-w-[370px]"
              : size === "sm"
              ? "max-w-[370px]"
              : size === "md"
              ? "max-w-[570px]"
              : "max-w-[770px]"
          }`}
        >
          {/* <header className="font-bold text-xl">{title}</header> */}
          {children}
        </div>
      </section>
      <section
        className="w-screen h-full cursor-pointer "
        onClick={() => {
          setIsOpen(false);
        }}
      ></section>
    </div>
  );
};
