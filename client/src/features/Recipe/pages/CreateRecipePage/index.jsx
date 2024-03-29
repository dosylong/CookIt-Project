import { Container } from '@chakra-ui/react';
import React, { useRef, useState } from 'react';
import CreateRecipeForm from '../../components/CreateRecipeForm';
import { useDropzone } from 'react-dropzone';
import recipeApi from '../../../../api/recipeApi';
import { storage } from '../../../../firebase';
import { useNavigate } from 'react-router-dom';
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function CreateRecipePage() {
  const [file, setFile] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [imgProgress, setImgProgress] = useState(0);
  const user = useRef(JSON.parse(localStorage.getItem('account')));
  const navigate = useNavigate();

  const onCreateRecipeImage = async (url) => {
    const response = await recipeApi.createRecipeImage({
      authorId: user.current?.uid,
      imageCover: url,
    });
    console.log(response);
  };

  const onCreateRecipe = async (values, file) => {
    try {
      const response = await recipeApi.createRecipe({
        authorId: user.current?.uid,
        ...values,
        imageCover: file[0].name,
      });

      console.log(response);
      const uploadTask = storage
        .ref(`recipes/${user.current?.email}/recipe/${file[0].name}`)
        .put(file[0]);
      uploadTask.on(
        'state_changed',
        (snapshot) => {
          const progress = Math.round(
            (snapshot.bytesTransferred / snapshot.totalBytes) * 100
          );
          setImgProgress(progress);
          console.log('Upload is ' + progress + '% done');
          setIsLoading(true);
        },
        (error) => {
          console.log(error);
          setIsLoading(false);
        },
        () => {
          storage
            .ref(`recipes/${user.current?.email}/recipe/`)
            .child(file[0].name)
            .getDownloadURL()
            .then((url) => {
              onCreateRecipeImage(url);
            })
            .then(() => {
              setTimeout(() => {
                navigate('/');
              }, 1400);
            })
            .catch((error) => {
              console.log(error);
            });
        }
      );
    } catch (error) {
      console.log(error);
    }
  };

  // const onLoadingImg = (file) => {
  //   if (!file[0]) return;
  //   const uploadTask = storage
  //     .ref(`recipes/${user.current?.email}/recipe/${file[0].name}`)
  //     .put(file[0]);
  //   uploadTask.on(
  //     'state_changed',
  //     (snapshot) => {
  //       const progress = Math.round(
  //         (snapshot.bytesTransferred / snapshot.totalBytes) * 100
  //       );
  //       setImgProgress(progress);
  //       console.log('Upload is ' + progress + '% done');
  //       setIsLoading(true);
  //       if (progress === 100) {
  //         setIsLoading(false);
  //       }
  //     },
  //     (error) => {
  //       console.log(error);
  //       setIsLoading(false);
  //     }
  //   );
  // };

  // const onCreateRecipe = (file) => {
  //   onLoadingImg(file);
  // };

  const onClickRemoveImage = (file) => {
    setFile([]);
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    accept: 'image/jpeg, image/png, image/jpg',
    maxFiles: 1,
    multiple: false,
    onDrop: (files) => {
      console.log(files);
      setFile(
        files.map((file) =>
          Object.assign(file, {
            preview: URL.createObjectURL(file),
          })
        )
      );
      onCreateRecipe(files);
    },

    onDropRejected: () => {
      toast.error('File is not an image!', {
        autoClose: 1200,
      });
    },
    //onDropAccepted: onCreateRecipe,
  });

  return (
    <>
      <Container maxW='container.xl'>
        <CreateRecipeForm
          getRootProps={getRootProps}
          getInputProps={getInputProps}
          isDragActive={isDragActive}
          file={file}
          onCreateRecipe={onCreateRecipe}
          isLoading={isLoading}
          imgProgress={imgProgress}
          onClickRemoveImage={onClickRemoveImage}
        />
      </Container>
      <ToastContainer />
    </>
  );
}
