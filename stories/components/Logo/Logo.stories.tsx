import React from 'react';
import { Story, Meta } from '@storybook/react';

import { Logo, LogoProps } from './Logo';

export default {
  title: 'Components/Logo',
  component: Logo,
  argTypes: {
    backgroundColor: { control: 'color' },
  },
} as Meta;

const Template: Story<LogoProps> = (args) => <Logo {...args} />;

export const LogoIcon = Template.bind({});
LogoIcon.args = {
  primary: true,
};
// export const Large = Template.bind({});
// Large.args = {
//   size: 'large',
//   label: 'Button',
// };

// export const Small = Template.bind({});
// Small.args = {
//   size: 'small',
//   label: 'Button',
// };
