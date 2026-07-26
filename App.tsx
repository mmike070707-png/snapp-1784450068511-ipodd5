import React from 'react';
import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { Theme } from './theme/AppTheme';
import { GameProvider } from './contexts/GameContext';

import BreweryPage from './screens/BreweryPage';
import ActivitiesPage from './screens/ActivitiesPage';
import BassFishingGame from './screens/BassFishingGame';
import HuntingGame from './screens/HuntingGame';
import SwampCampingGame from './screens/SwampCampingGame';
import StorePage from './screens/StorePage';
import MoreScreen from './screens/MoreScreen';
import ProfilePage from './screens/ProfilePage';
import SocialPage from './screens/SocialPage';
import AnalyticsDashboardPage from './screens/AnalyticsDashboardPage';
import AdminPanelPage from './screens/AdminPanelPage';
import CharactersPage from './screens/CharactersPage';

const Tab = createBottomTabNavigator();
const MoreStack = createNativeStackNavigator();
const ActivitiesStack = createNativeStackNavigator();

const navTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    background: Theme.colors.background,
    card: Theme.colors.surface,
    text: Theme.colors.text,
    border: Theme.colors.border,
    primary: Theme.colors.selection.active,
    notification: Theme.colors.secondary,
  },
};

const stackScreenOptions = {
  headerStyle: { backgroundColor: Theme.colors.surface },
  headerTintColor: Theme.colors.text,
  headerTitleStyle: {
    fontWeight: Theme.typography.fontWeight.bold,
    color: Theme.colors.text,
  },
  headerBackTitle: 'Back',
  animation: 'slide_from_right' as const,
  contentStyle: { backgroundColor: Theme.colors.background },
};

function ActivitiesStackNavigator() {
  return (
    <ActivitiesStack.Navigator screenOptions={stackScreenOptions}>
      <ActivitiesStack.Screen
        name="ActivitiesHome"
        component={ActivitiesPage}
        options={{ headerShown: false }}
      />
      <ActivitiesStack.Screen
        name="BassFishing"
        component={BassFishingGame}
        options={{ headerShown: false }}
      />
      <ActivitiesStack.Screen
        name="Hunting"
        component={HuntingGame}
        options={{ headerShown: false }}
      />
      <ActivitiesStack.Screen
        name="SwampCamping"
        component={SwampCampingGame}
        options={{ headerShown: false }}
      />
    </ActivitiesStack.Navigator>
  );
}

function MoreStackNavigator() {
  return (
    <MoreStack.Navigator screenOptions={stackScreenOptions}>
      <MoreStack.Screen
        name="MoreHome"
        component={MoreScreen}
        options={{ headerShown: false }}
      />
      <MoreStack.Screen
        name="Profile"
        component={ProfilePage}
        options={{ title: 'MOONSHINE TURF', headerShown: false }}
      />
      <MoreStack.Screen
        name="Social"
        component={SocialPage}
        options={{ title: 'Social Sharing', headerShown: false }}
      />
      <MoreStack.Screen
        name="Analytics"
        component={AnalyticsDashboardPage}
        options={{ title: 'Analytics', headerShown: false }}
      />
      <MoreStack.Screen
        name="Admin"
        component={AdminPanelPage}
        options={{ title: 'Admin Panel', headerShown: false }}
      />
      <MoreStack.Screen
        name="Characters"
        component={CharactersPage}
        options={{ title: 'The Park Folk', headerShown: false }}
      />
    </MoreStack.Navigator>
  );
}

export default function App() {
  return (
    <SafeAreaProvider>
      <GameProvider>
        <NavigationContainer theme={navTheme}>
          <Tab.Navigator
            screenOptions={({ route }) => ({
              headerShown: false,
              tabBarStyle: {
                backgroundColor: Theme.colors.surface,
                borderTopColor: Theme.colors.border,
                borderTopWidth: 1,
                paddingBottom: 4,
                paddingTop: 4,
                height: 60,
              },
              tabBarActiveTintColor: Theme.colors.selection.active,
              tabBarInactiveTintColor: Theme.colors.selection.inactive,
              tabBarLabelStyle: {
                fontSize: Theme.typography.fontSize.xs,
                fontWeight: Theme.typography.fontWeight.semibold,
                marginBottom: 2,
              },
              tabBarIcon: ({ focused, color, size }) => {
                const icons: Record<string, [string, string]> = {
                  Brewery: ['flask', 'flask-outline'],
                  Activities: ['fish', 'fish-outline'],
                  Store: ['cash', 'cash-outline'],
                  More: ['menu', 'menu-outline'],
                };
                const [activeIcon, inactiveIcon] = icons[route.name] ?? ['ellipse', 'ellipse-outline'];
                return (
                  <Ionicons
                    name={(focused ? activeIcon : inactiveIcon) as any}
                    size={size}
                    color={color}
                  />
                );
              },
            })}
          >
            <Tab.Screen name="Brewery" component={BreweryPage} />
            <Tab.Screen name="Activities" component={ActivitiesStackNavigator} />
            <Tab.Screen name="Store" component={StorePage} />
            <Tab.Screen name="More" component={MoreStackNavigator} />
          </Tab.Navigator>
        </NavigationContainer>
      </GameProvider>
    </SafeAreaProvider>
  );
}
