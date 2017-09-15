import React from 'react';
import { StyleSheet, Text, View, Button } from 'react-native';
import { Google } from 'expo';
import firebase from 'firebase';
import axios from 'axios';
import qs from 'qs';
import { auth } from '../../firebase';
import Config from '../../config.json';
import store from '../store/userStore';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});

export default class App extends React.Component {
  static navigationOptions = {
    title: 'Login',
    headerLeft: null,
  };
  constructor() {
    super();
    this.state = {
      user: null,
    };
    this.login = this.login.bind(this);
  }

  login = () => {
    Google.logInAsync({
      iosClientId: Config.REACT_APP_IOS_CLIENT_ID,
      scopes: ['profile', 'email', 'https://www.googleapis.com/auth/calendar'],
    })
      .then((result) => {
        if (result.type === 'success') {
          const credential = firebase.auth.GoogleAuthProvider.credential(result.idToken);
          firebase.auth().signInWithCredential(credential);
        }
        return result.accessToken;
      })
      .then((accessToken) => {
        auth.currentUser.getIdToken()
          .then((idToken) => {
            const config = {
              url: 'http://localhost:5000/testproject-6177f/us-central1/addUser',
              payload: qs.stringify({ idToken, OAuthToken: accessToken }),
            };
            axios.post(config.url, config.payload);
          });
      })
      .then(() => {
        // dispatch unique user id to redux store
        const uid = auth.currentUser.uid;
        store.dispatch({
          type: 'LOG_IN',
          uniqueUserId: uid,
        });
      })
      .then(() => this.navigateToPlaid())
      .catch(error => console.log(error));
  }

  navigateToPlaid = () => {
    this.props.navigation.navigate('Plaid');
  }

  render() {
    return (
      <View style={styles.container}>
        <Text>{'Where\'s My Money?'}</Text>
        <Button title={'Sign in with Google'} onPress={this.login} />
      </View>
    );
  }
}

