import React from 'react';
import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import Home from './pages/Home';

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/* Theme variables */
import './theme/variables.css';

import {MoviesList,MoviesEdit} from './Movies';
import { MovieProvider } from './Movies/MovieProvider';

const App: React.FC = () => (
  <IonApp>
    <MovieProvider>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/movies" component={MoviesList} exact={true}/>
          <Route path="/movie" component={MoviesEdit} exact={true}/>
          <Route path="/movie/:id" component={MoviesEdit} exact={true}/>
          <Route exact path="/" render={() => <Redirect to="/movies" />} />
        </IonRouterOutlet>
      </IonReactRouter>
    </MovieProvider>
  </IonApp>
);

export default App;
