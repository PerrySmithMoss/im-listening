// import { Drawer } from "../Drawer/Drawer";
import {
  ActionIcon,
  Avatar,
  Drawer,
  useMantineColorScheme,
} from "@mantine/core";
import { MoonIcon, SunIcon } from "@modulz/radix-icons";
import { useRouter } from "next/dist/client/router";
import Link from "next/link";
import { useGlobalUIContext } from "../../context/GlobalUI.context";
import { useGetCurrentUserQuery } from "../../graphql/generated/graphql";
import { isServer } from "../../utils/isServer";
import { Navbar } from "../Navbar/Navbar";
import styles from "./Layout.module.css";

interface LayoutProps {}

export const Layout: React.FC<LayoutProps> = ({ children }) => {
  const { isMobileDrawerOpen, setIsMobileDrawerOpen } = useGlobalUIContext();
  const { data, loading } = useGetCurrentUserQuery({ skip: isServer() });
  const { colorScheme, toggleColorScheme } = useMantineColorScheme();
  const dark = colorScheme === "dark";

  const router = useRouter();
  const arrOfRoute = router.route.split("/");
  const baseRoute = "/" + arrOfRoute[1];
  return (
    <>
      <div>{children}</div>
      <Drawer
        opened={isMobileDrawerOpen}
        onClose={() => setIsMobileDrawerOpen(false)}
        padding="xl"
        position="right"
        size="md"
      >
        <div className={`${styles.mobileDrawerNav} flex flex-col`}>
          <ol>
            <li>
              <Link href="/">
                <a className={baseRoute === "/" ? "text-brand-orange" : "hover:text-brand-orange_hover"}>
                  Home
                </a>
              </Link>
            </li>
            <li>
              <Link href="/projects">
                <a
                  className={
                    baseRoute === "/explore" ? "text-brand-orange" : "hover:text-brand-orange_hover"
                  }
                >
                  Explore
                </a>
              </Link>
            </li>
            <li>
              <Link href="/about">
                <a
                  className={
                    router.pathname === "/popular" ? "text-brand-orange" : "hover:text-brand-orange_hover"
                  }
                >
                  Popular
                </a>
              </Link>
            </li>
          </ol>
          <div className={`${styles.navbarMobileButon} mt-auto group`}>
            <Avatar
              // onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
              size={32}
              radius="xl"
              className="cursor-pointer"
              src={data?.getCurrentUser?.profile.avatar as string}
            />
            <button className="bg-transparent group-hover:text-brand-orange_hover">Logout</button>
          </div>
          <div className={`flex items-center justify-center mt-auto`}>
            <ActionIcon
              variant="outline"
              size="lg"
              color={dark ? "orange" : "orange"}
              onClick={() => toggleColorScheme()}
              title="Toggle color scheme"
            >
              {dark ? (
                <SunIcon style={{ width: 18, height: 18 }} />
              ) : (
                <MoonIcon style={{ width: 18, height: 18 }} />
              )}
            </ActionIcon>
          </div>
        </div>
      </Drawer>
    </>
  );
};
