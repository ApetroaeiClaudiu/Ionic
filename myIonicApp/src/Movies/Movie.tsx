import React from 'react';
import { IonItem, IonLabel } from '@ionic/react';
import {MovieProps} from './MovieProps';

interface MoviePropsExt extends MovieProps {
  onEdit: (id?: number) => void;
}

const Movie: React.FC<MoviePropsExt> = ({ id, director,title,year,treiD,price, onEdit }) => {
  console.log(treiD);
  return (
    <IonItem onClick={() => onEdit(id)}>
        <IonLabel>Movie : {title} by {director} in {year} with: {price} and {treiD}</IonLabel>
    </IonItem>
  );
};

export default Movie;
