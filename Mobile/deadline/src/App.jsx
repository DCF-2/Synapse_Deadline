import React from 'react';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import { Route } from 'react-router-dom';

// Estilos Globais e Bootstrap
import 'bootstrap/dist/css/bootstrap.min.css';
import './styles/theme.css';

// Estilos Nativos do Ionic
import '@ionic/react/css/core.css';
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

// Páginas
import ClienteHome from './pages/ClienteHome';
import LojaPerfil from './pages/LojaPerfil';

setupIonicReact();

export default function App() {
  return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          
          <Route exact path="/">
            <ClienteHome />
          </Route>
          
          <Route path="/loja/:id">
            <LojaPerfil />
          </Route>

        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
}