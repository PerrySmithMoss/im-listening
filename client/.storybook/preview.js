import { MINIMAL_VIEWPORTS } from "@storybook/addon-viewport";
import * as nextImage from 'next/image';

Object.defineProperty(nextImage, 'default', {
  configurable: true,
  value: props => <img {...props} />
});

const customViewports = {
  kindleFire2: {
    name: "Kindle Fire 2",
    styles: {
      width: "600px",
      height: "963px",
    },
  },
  kindleFireHD: {
    name: "Kindle Fire HD",
    styles: {
      width: "533px",
      height: "801px",
    },
  },
  SmallLaptop: {
    name: "Small Laptop",
    styles: {
      width: "1024px",
      height: "670px",
    },
  },
  LargeLaptop: {
    name: "Large Laptop",
    styles: {
      width: "1440px",
      height: "705px",
    },
  },
    SmallDesktop: {
      name: "Small Desktop",
      styles: {
        width: "1920px",
        height: "1080px",
      },
    },
    LargeDesktop: {
      name: "Large Desktop",
      styles: {
        width: "2560px",
        height: "1218px",
      },
    }
};

export const parameters = {
  actions: { argTypesRegex: "^on[A-Z].*" },
  controls: {
    matchers: {
      color: /(background|color)$/i,
      date: /Date$/,
    },
  },
  viewport: {
    viewports: { ...MINIMAL_VIEWPORTS, ...customViewports },
  },
};
