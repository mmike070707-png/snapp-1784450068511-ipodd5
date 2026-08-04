import React from 'react';
import PlaceholderPage from '../components/PlaceholderPage';

interface SocialPageProps {
  navigation: any;
}

const SocialPage: React.FC<SocialPageProps> = ({ navigation }) => {
  return (
    <PlaceholderPage
      pageTitle="Social Sharing"
      pageName="social"
      description="Share achievements and brewery progress with friends"
      suggestedPrompt="Add social sharing functionality allowing users to share their brewery builds, achievements, and progress screenshots to Facebook, Instagram, and Twitter"
      navigation={navigation}
    />
  );
};

export default SocialPage;
