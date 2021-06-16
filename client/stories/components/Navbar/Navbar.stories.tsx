import React from 'react';
import { Story, Meta } from '@storybook/react';

import { Navbar, NavbarProps } from './Navbar';

export default {
  title: 'components/Navbar',
  component: Navbar,
} as Meta;

const Template: Story<NavbarProps> = (args) => <Navbar {...args} />;

export const LoggedIn = Template.bind({});
LoggedIn.args = {
  user: {
  },
  primary: true,
};

export const LoggedOut = Template.bind({});
LoggedOut.args = {
  primary: true,
};
