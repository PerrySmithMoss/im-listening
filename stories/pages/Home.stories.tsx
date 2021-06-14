import React from 'react';
import { Story, Meta } from '@storybook/react';

import { Home, HomeProps } from './Home';
import * as HeaderStories from '../Header.stories';

export default {
  title: 'Pages/Home',
  component: Home,
} as Meta;

const Template: Story<HomeProps> = (args) => <Home {...args} />;

export const LoggedIn = Template.bind({});
LoggedIn.args = {
  ...HeaderStories.LoggedIn.args,
};

export const LoggedOut = Template.bind({});
LoggedOut.args = {
  ...HeaderStories.LoggedOut.args,
};
