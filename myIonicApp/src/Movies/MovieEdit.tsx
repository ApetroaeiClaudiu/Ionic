import React, { useContext, useEffect, useState } from 'react';
import {
  IonActionSheet,
  IonButton,
  IonButtons,
  IonCheckbox,
  IonCol,
  IonContent,
  IonDatetime,
  IonFab,
  IonFabButton,
  IonHeader,
  IonIcon,
  IonImg,
  IonInput,
  IonLoading,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar
} from '@ionic/react';
import { getLogger } from '../core';
import { MovieContext } from './MovieProvider';
import { RouteComponentProps } from 'react-router';
import { MovieProps } from './MovieProps';
import { usePhotoGallery } from './usePhotoGallery';
import { camera, trash } from 'ionicons/icons';
import { useMyLocation } from '../maps/useLocation';
import { MyMap } from '../maps/MyMap';

const log = getLogger('MovieEdit');

interface MovieEditProps extends RouteComponentProps<{
  id?: string;
}> {}

const MovieEdit: React.FC<MovieEditProps> = ({ history, match }) => {
  const {myLocation, updateMyPosition} = useMyLocation();
  const { lat: lat2, lng: lng2 } = myLocation || {}
  const { takePhoto} = usePhotoGallery();
  const { movies, saving, deleting,  savingError,saveMovie } = useContext(MovieContext);
  const [title,setTitle] = useState('');
  const [director,setDirector] = useState('');
  const [year,setYear] = useState(new Date());
  const [treiD,setTreiD] = useState(false);
  const [price,setPrice] = useState(0);
  const [movie, setMovie] = useState<MovieProps>();
  const [userId, setUserId] =useState('');
  const [version,setVersion] = useState(0);
  const [webViewPath,setWebViewPath] = useState('');
  const [lat, setLat] = useState(0);
  const [lng, setLng] = useState(0);

  useEffect(() => {
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
      setLat(movie.lat);
      setLng(movie.lng);
      setWebViewPath(movie.webViewPath);
      updateMyPosition('current', movie.lat, movie.lng);
    }
  }, [match.params.id, movies]);
  
  const handleSave = () => {
    const editedMovie = movie ? { ...movie, title,director,year,treiD,price,userId,version,webViewPath,lat,lng } : { title,director,year,treiD,price,userId,version,webViewPath,lat,lng };
    saveMovie && saveMovie(editedMovie).then(() => history.goBack());
  };

  async function handlePhotoChange() {
    const image = await takePhoto();
    if (!image) {
      setWebViewPath('');
    } else {
      setWebViewPath(image);
    }
  }

  function handleMapOnClick() {
    return (e: any) => {
      updateMyPosition('current', e.latLng.lat(), e.latLng.lng());
      setLat(e.latLng.lat());
      setLng(e.latLng.lng());
    }
  }

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
        {webViewPath && (<img onClick={handlePhotoChange} src={webViewPath} width={'100px'} height={'100px'}/>)}
        {!webViewPath && (<img onClick={handlePhotoChange} src={'https://static.thenounproject.com/png/187803-200.png'} width={'100px'} height={'100px'}/>)}
        <MyMap
            lat={lat2}
            lng={lng2}
            onMapClick={handleMapOnClick()}
        />
        
        <IonLoading isOpen={saving || deleting} />
        {savingError && (
          <div>{savingError.message || 'Failed to save movie'}</div>
        )}
        </IonContent>
    </IonPage>
  );
};

export default MovieEdit;
