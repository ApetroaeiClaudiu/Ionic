import React, { useContext, useEffect, useState } from 'react';
import {
  IonButton,
  IonButtons,
  IonCheckbox,
  IonContent,
  IonDatetime,
  IonHeader,
  IonInput,
  IonLoading,
  IonPage,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { MovieContext } from './MovieProvider';
import { RouteComponentProps } from 'react-router';
import { MovieProps } from './MovieProps';

const log = getLogger('MovieEdit');

interface MovieEditProps extends RouteComponentProps<{
  id?: string;
}> {}

const MovieEdit: React.FC<MovieEditProps> = ({ history, match }) => {
  const { movies, saving, deleting,  savingError,saveMovie } = useContext(MovieContext);
  const [title,setTitle] = useState('');
  const [director,setDirector] = useState('');
  const [year,setYear] = useState(new Date());
  const [treiD,setTreiD] = useState(false);
  const [price,setPrice] = useState(0);
  const [movie, setMovie] = useState<MovieProps>();
  const [userId, setUserId] =useState('');
  const [version,setVersion] = useState(0);

  useEffect(() => {
    //log('useEffect');
    const routeId = match.params.id || '';
    const movie = movies?.find(mov => mov._id?.toString() === routeId);
    setMovie(movie);
    if (movie) {
      setTitle(movie.title);
      setDirector(movie.director);
      setYear(movie.year);
      setTreiD(movie.treiD);
      setPrice(movie.price);
      setUserId(movie.userId);
      setVersion(movie.version);
    }
  }, [match.params.id, movies]);
  
  const handleSave = () => {
    const editedMovie = movie ? { ...movie, title,director,year,treiD,price,userId,version } : { title,director,year,treiD,price,userId,version };
    saveMovie && saveMovie(editedMovie).then(() => history.goBack());
  };
  log('render');
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Edit</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleSave}>
              Save
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>
      <IonContent>
        <IonInput value={title} onIonChange={e => setTitle(e.detail.value || '')} />
        <IonInput value={director} onIonChange={e => setDirector(e.detail.value || '')} />
        <IonDatetime displayFormat="MM DD YY" value={year.toString()} onIonChange={e => setYear(new Date(e.detail.value!))}></IonDatetime>
        <IonCheckbox checked={treiD} onIonChange={e => setTreiD(e.detail.checked)} />
        <IonInput type="number" value={price} onIonChange={e => setPrice(parseInt(e.detail.value!,0))} />
        <IonLoading isOpen={saving || deleting} />
        {savingError && (
          <div>{savingError.message || 'Failed to save movie'}</div>
        )}
        </IonContent>
    </IonPage>
  );
};

export default MovieEdit;
