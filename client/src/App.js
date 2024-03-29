import React, { useEffect, useRef, useState } from 'react';
import { ChakraProvider } from '@chakra-ui/react';
import customTheme from './theme';
import Auth from './features/Auth';
import Profile from './features/Profile';
import Recipe from './features/Recipe';
import Layout from './layout';
import './App.css';
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  useNavigate,
} from 'react-router-dom';
import { auth } from './firebase';
import Home from './features/Home/pages/HomePage';
import Admin from './features/Admin';
import NotFound from './components/NotFound';
import userApi from './api/userApi';

function App() {
  const user = useRef(JSON.parse(localStorage.getItem('account')));
  const [userProfile, setUserProfile] = useState({});

  const isAdmin = process.env.REACT_APP_ADMIN_UID === user.current?.uid;

  useEffect(() => {
    const unregisterAuthObserver = auth.onAuthStateChanged(async (user) => {
      if (!user) {
        console.log('User is not logged in');
        return;
      } else {
        const currentUser = auth.currentUser;
        if (currentUser) {
          console.log('Logged in user: ', currentUser);
          localStorage.setItem('account', JSON.stringify(currentUser));
        }
      }
    });
    return () => unregisterAuthObserver();
  }, []);

  useEffect(() => {
    const getUserProfile = async () => {
      if (!user.current) return;
      try {
        const response = await userApi.getUserProfile({
          userFirebaseId: user.current?.uid,
        });
        setUserProfile(response);
      } catch (error) {
        console.log(error);
      }
    };
    getUserProfile();
  }, []);

  return (
    <ChakraProvider theme={customTheme}>
      <BrowserRouter>
        <Routes>
          {/* <Route
            path='account/*'
            element={!user.current ? <Auth /> : <Navigate to='/' replace />}
          /> */}
          <Route
            path='account/*'
            element={
              userProfile.userFirebaseId ? (
                <Navigate to='/' replace />
              ) : (
                <Auth />
              )
            }
          />

          <Route
            path='admin/*'
            element={!isAdmin ? <Navigate to='/' replace /> : <Admin />}
          />
          <Route
            path='/'
            element={
              isAdmin ? (
                <AdminRoute />
              ) : (
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              )
            }>
            <Route path='profile/*' element={<Profile />} />
            <Route path='recipe/*' element={<Recipe />} />
            <Route path='/' element={<Home />} />
          </Route>
          <Route path='*' element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </ChakraProvider>
  );
}

function AdminRoute() {
  const user = JSON.parse(localStorage.getItem('account'));
  const isAdmin = process.env.REACT_APP_ADMIN_UID === user?.uid;

  if (isAdmin) {
    return <Navigate to='/admin/dashboard' replace />;
  }
}

function ProtectedRoute({ children }) {
  const user = useRef(JSON.parse(localStorage.getItem('account')));
  const navigate = useNavigate();

  useEffect(() => {
    const checkUserProfile = async () => {
      if (!user.current) return;
      try {
        const response = await userApi.checkUserExist({
          userFirebaseId: user.current?.uid,
        });
        console.log(response.message);
        if (response.message === 'user-profile-not-found') {
          return navigate('/account/register-profile');
        }
      } catch (error) {
        console.log(error);
      }
    };
    checkUserProfile();
  }, [navigate]);
  return children;
}

export default App;
