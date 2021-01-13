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
  IonModal,
  IonPage,
  IonRow,
  IonTitle,
  IonToolbar,
  createAnimation
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
  const  [showModal, setShowModal] = useState(false);
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

  

  const enterAnimation = (baseEl: any) => {
    const backdropAnimation = createAnimation()
      .addElement(baseEl.querySelector('ion-backdrop')!)
      .fromTo('opacity', '0.01', 'var(--backdrop-opacity)');

    const wrapperAnimation = createAnimation()
      .addElement(baseEl.querySelector('.modal-wrapper')!)
      .keyframes([
        { offset: 0, opacity: '0', transform: 'scale(0)' },
        { offset: 1, opacity: '0.99', transform: 'scale(1)' }
      ]);

    return createAnimation()
      .addElement(baseEl)
      .easing('ease-out')
      .duration(500)
      .addAnimation([backdropAnimation, wrapperAnimation]);
  }

  const leaveAnimation = (baseEl: any) => {
    return enterAnimation(baseEl).direction('reverse');
  }
  
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


  async function chainAnimation() {
    let animation1 = createAnimation()
    .addElement(document.getElementById("title")!)
    .duration(2000)
    .iterations(1)
    .keyframes([
      { offset: 0, transform: 'scale(1))', opacity: '1' },
      { offset: 0.5, transform: 'scale(0.2)', opacity: '0.3' },
      { offset: 1, transform: 'scale(1)', opacity: '1' }
    ]);

    let animation2 = createAnimation()
    .addElement(document.getElementById("director")!)
    .duration(2000)
    .iterations(1)
    .keyframes([
      { offset: 0, transform: 'scale(1))', opacity: '1' },
      { offset: 0.5, transform: 'scale(0.4)', opacity: '0.3' },
      { offset: 1, transform: 'scale(1)', opacity: '1' }
    ]);

    let animation3 = createAnimation()
    .addElement(document.getElementById("price")!)
    .duration(2000)
    .iterations(1)
    .keyframes([
      { offset: 0, transform: 'scale(1))', opacity: '1' },
      { offset: 0.5, transform: 'scale(0.8)', opacity: '0.3' },
      { offset: 1, transform: 'scale(1)', opacity: '1' }
    ]);

    await animation1.play()
    await animation2.play()
    await animation3.play()
  }

  function groupAnimation() {
    let animation1 = createAnimation()
    .addElement(document.getElementById("title")!)
    .duration(2000)
    .iterations(1)
    .fromTo('background', 'blue', 'var(--background)');

    let animation2 = createAnimation()
    .addElement(document.getElementById("director")!)
    .duration(2000)
    .iterations(1)
    .fromTo('background', 'yellow', 'var(--background)');

    let animation3 = createAnimation()
    .addElement(document.getElementById("price")!)
    .duration(2000)
    .iterations(1)
    .fromTo('background', 'red', 'var(--background)');

    const parent = createAnimation()
    .duration(1000)
    .iterations(Infinity)
    .addAnimation([animation1, animation2, animation3]);
    parent.play()
  }

  function basicAnimation() {
    let animation = createAnimation()
    .addElement(document.getElementById("check")!)
    .duration(3000)
    .iterations(1)
    .fromTo('transform', 'translateX(0px)', 'translateX(100px)')
    .fromTo('opacity', '1', '0.2');
    animation.play()
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
        <IonInput value={title} id='title' onIonChange={e => {setTitle(e.detail.value || ''); groupAnimation()}} />
        <IonInput value={director} id='director' onIonChange={e => {setDirector(e.detail.value || ''); groupAnimation()}} />
        <IonDatetime displayFormat="MM DD YY" value={year.toString()} onIonChange={async e => {setYear(new Date(e.detail.value!)); await chainAnimation()}}></IonDatetime>
        <IonCheckbox checked={treiD} id='check' onIonChange={e => {setTreiD(e.detail.checked); basicAnimation()}} />
        <IonInput type="number" value={price} id='price' onIonChange={e => {setPrice(parseInt(e.detail.value!,0)); groupAnimation()}} />
        {webViewPath && (<img onClick={handlePhotoChange} src={webViewPath} width={'100px'} height={'100px'}/>)}
        {!webViewPath && (<img onClick={handlePhotoChange} src={'https://static.thenounproject.com/png/187803-200.png'} width={'100px'} height={'100px'}/>)}
        <IonModal isOpen={showModal} enterAnimation={enterAnimation} leaveAnimation={leaveAnimation}>
          <MyMap
              lat={lat2}
              lng={lng2}
              onMapClick={handleMapOnClick()}
          />
          <IonButton onClick={() => setShowModal(false)}>Close Map</IonButton>
        </IonModal>
        <IonButton onClick={() => setShowModal(true)}>Select Location</IonButton>

        <IonLoading isOpen={saving || deleting} />
        {savingError && (
          <div>{savingError.message || 'Failed to save movie'}</div>
        )}
        </IonContent>
    </IonPage>
  );
};

export default MovieEdit;
