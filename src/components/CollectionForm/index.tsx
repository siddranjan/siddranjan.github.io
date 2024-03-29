import { Button, Grid, Paper, TextField } from '@mui/material';
import { useFormik } from 'formik';
import Image from 'next/image';
import { useState } from 'react';

import LoaderButton from '@/components/LoaderButton';
import SortableGrid from '@/components/SortableGrid';
import UploadDrawer from '@/components/UploadDrawer';
import { Collection } from '@/utils/collection-config';
import { pushToUniqueList } from '@/utils/deduplicated-list';
import { getPictureSource } from '@/utils/picture-source';
import CoverSelectionDrawer from '../CoverSelectionDrawer';

export default function CollectionForm({
  collection,
  isLoading = false,
  createMode = false,
  onSubmit,
}: {
  createMode?: boolean;
  collection: Collection;
  isLoading?: boolean;
  // eslint-disable-next-line no-unused-vars
  onSubmit: (collection: Collection, uploadedFiles: File[]) => void;
}) {
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [coverPictureDrawerOpen, setCoverPictureDrawerOpen] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  const collectionForm = useFormik({
    initialValues: collection,
    onSubmit: (finalCollectionData) =>
      onSubmit(finalCollectionData, uploadedFiles),
  });

  function handleDrawerClose(uploadedImages: File[]) {
    if (createMode) {
      setUploadedFiles(uploadedImages);
    }

    const deduplicatedPictures = pushToUniqueList(
      collectionForm.values.pictures,
      uploadedImages.map((x) => x.name),
    );

    collectionForm.setFieldValue('pictures', deduplicatedPictures);

    setUploadModalOpen(false);
  }

  return (
    <form onSubmit={collectionForm.handleSubmit}>
      <Paper sx={{ p: 2 }}>
        <Grid container spacing={2}>
          <Grid item xs={6}>
            <TextField
              fullWidth
              id="title"
              name="title"
              label="Title"
              onChange={collectionForm.handleChange}
              value={collectionForm.values.title}
            />
          </Grid>
          <Grid item xs={6}>
            <TextField
              fullWidth
              id="slug"
              name="slug"
              label="Slug"
              onChange={collectionForm.handleChange}
              defaultValue={collectionForm.values.slug}
            />
          </Grid>
          <Grid item xs={12}>
            <TextField
              fullWidth
              multiline
              id="description"
              name="description"
              label="Description"
              onChange={collectionForm.handleChange}
              defaultValue={collectionForm.values.description}
            />
          </Grid>
          <Grid item xs={12}>
            <Grid container paddingBottom={1}>
              <Grid item xs={1} marginY="auto">
                <h3>Cover</h3>
              </Grid>
              <Grid item xs={11}>
                <CoverSelectionDrawer
                  slug={collection.slug}
                  uploadedFiles={uploadedFiles}
                  createMode={createMode}
                  pictures={collectionForm.values.pictures}
                  show={coverPictureDrawerOpen}
                  onSelect={(coverPicture) => {
                    if (coverPicture) {
                      collectionForm.setFieldValue('cover', coverPicture);
                    }
                    setCoverPictureDrawerOpen(false);
                  }}
                />
                <Button
                  variant="outlined"
                  style={{ marginLeft: 10 }}
                  onClick={() => setCoverPictureDrawerOpen(true)}
                >
                  Select
                </Button>
              </Grid>
            </Grid>
            {collectionForm.values.cover && (
              <Image
                height={200}
                width={200}
                quality={20}
                key={collectionForm.values.cover}
                src={getPictureSource({
                  picture: collectionForm.values.cover,
                  createMode,
                  uploadedFiles,
                  slug: collection.slug,
                })}
                alt={collectionForm.values.cover}
              />
            )}
          </Grid>
          <Grid item xs={12}>
            <Grid container paddingBottom={1}>
              <Grid item xs={1} marginY="auto">
                <h3>Pictures</h3>
              </Grid>
              <Grid item xs={11}>
                <UploadDrawer
                  createMode={createMode}
                  collectionId={collection.id}
                  show={uploadModalOpen}
                  handleClose={handleDrawerClose}
                />
                <Button
                  variant="outlined"
                  style={{ marginLeft: 10 }}
                  onClick={() => setUploadModalOpen(true)}
                >
                  Upload
                </Button>
              </Grid>
            </Grid>
            <SortableGrid
              items={collectionForm.values.pictures.map((picture) => ({
                id: picture,
                itemNode: (
                  <Image
                    height={200}
                    width={200}
                    quality={20}
                    key={picture}
                    src={getPictureSource({
                      picture,
                      createMode,
                      uploadedFiles,
                      slug: collection.slug,
                    })}
                    alt={picture}
                  />
                ),
              }))}
              onChange={(items) =>
                collectionForm.setFieldValue(
                  'pictures',
                  items.map((item) => item.id),
                )
              }
            />
          </Grid>
          <Grid item xs={12}>
            <LoaderButton loading={isLoading}>
              {createMode ? 'Create' : 'Update'}
            </LoaderButton>
          </Grid>
        </Grid>
      </Paper>
    </form>
  );
}
