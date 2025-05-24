import {
  List,
  Datagrid,
  TextField,
  NumberField,
  BooleanField,
  EditButton,
  DeleteButton,
  Edit,
  Create,
  SimpleForm,
  TextInput,
  NumberInput,
  BooleanInput,
  ReferenceInput,
  SelectInput,
  ImageField,
  ImageInput,
  required,
  minValue,
  SaveButton,
  Toolbar,
  useRecordContext,
} from 'react-admin';
import { useEffect, useState } from 'react';

import InputValidation from '../../utils/InputValidation';

// Custom toolbar with fixed position
const CustomToolbar = props => (
  <Toolbar
    {...props}
    style={{
      position: 'sticky',
      bottom: 0,
      width: '100%',
      backgroundColor: 'white',
      zIndex: 2,
      boxShadow: '0px -2px 5px rgba(0, 0, 0, 0.1)',
      padding: '16px',
    }}
  >
    <SaveButton />
  </Toolbar>
);

// Custom ImageField that prepends IMAGE_URL to non-blob sources
const CustomImageField = (props) => {
  const record = useRecordContext();
  const [imageUrl, setImageUrl] = useState('');
  
  useEffect(() => {
    const loadImageUrl = async () => {
      const { IMAGE_URL } = await import('../../config/index.js');
      setImageUrl(IMAGE_URL);
    };
    loadImageUrl();
  }, []);
  
  if (!record || !imageUrl) return null;
  
  const src = record[props.source];
  if (!src) return null;
  
  // Function to get the proper image URL
  const getProperImageUrl = (src) => {
    // If it's already a blob URL or a full URL, return as is
    if (typeof src === 'string' && (src.startsWith('blob:') || src.startsWith('http://') || src.startsWith('https://'))) {
      return src;
    }
    
    // If it's a string but not a blob or full URL, prepend IMAGE_URL
    if (typeof src === 'string') {
      return `${imageUrl}${src}`;
    }
    
    // If it's an object with a src property (like from the backend)
    if (src && typeof src === 'object' && src.src) {
      if (src.src.startsWith('blob:') || src.src.startsWith('http://') || src.src.startsWith('https://')) {
        return src.src;
      }
      return `${imageUrl}${src.src}`;
    }
    
    // If it's an object with a rawFile property (like from file upload)
    if (src && typeof src === 'object' && src.rawFile) {
      return URL.createObjectURL(src.rawFile);
    }
    
    // Fallback
    return null;
  };
  
  const imageSource = getProperImageUrl(src);
  if (!imageSource) return null;
  
  return (
    <img 
      src={imageSource}
      title={record[props.title] || 'Product Image'} 
      alt={record[props.title] || 'Product Image'} 
      style={{ maxWidth: '100%', maxHeight: '200px' }}
    />
  );
};

// List component for products
export const ProductList = (props) => (
  <List {...props} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid>
      <TextField source="title" />
      <TextField source="shortDesc" />
      <NumberField source="price" options={{ style: 'currency', currency: 'USD' }} />
      <NumberField source="stockQuantity" label="Stock" />
      <TextField source="category.name" label="Category" />
      <BooleanField source="isActive" />
      <EditButton />
      <DeleteButton />
    </Datagrid>
  </List>
);

// Edit component for products
export const ProductEdit = (props) => (
  <Edit {...props}>
    <div style={{ height: '600px', overflow: 'scroll', padding: '16px', border: '1px solid #eee' }}>
      <SimpleForm
        toolbar={<CustomToolbar />}
        style={{
          marginBottom: '60px' // Space for the toolbar
        }}
      >
        {/* Required fields */}
        <TextInput 
          source="title" 
          validate={required()} 
          parse={(value) => InputValidation(value, "letter" ,25)} 
          helperText="Maximum 25 characters allowed"
        />
        <TextInput 
          source="shortDesc" 
          validate={required()} 
          multiline 
          parse={(value) => InputValidation(value, "letter" ,100)} 
          helperText="Brief description limited to 100 characters"
        />
        <TextInput 
          source="longDesc" 
          validate={required()} 
          multiline 
          parse={(value) => InputValidation(value, "letter" ,1000)} 
          helperText="Detailed description limited to 1000 characters"
        />
        <NumberInput 
          source="price" 
          validate={[required(), minValue(0)]} 
          helperText="Enter a positive value"
        />
        <NumberInput 
          source="stockQuantity" 
          label="Stock" 
          validate={[required(), minValue(0)]} 
          helperText="Enter available quantity"
        />
        {/* SKU is auto-generated on the backend */}
        <ReferenceInput source="categoryId" reference="categories">
          <SelectInput 
            optionText="name" 
            validate={required()} 
            helperText="Select a product category"
          />
        </ReferenceInput>

        {/* Hidden fields with defaults */}
        <BooleanInput source="isActive" defaultValue={true} style={{ display: 'none' }} />

        {/* Images */}
        <ImageInput
          source="file"
          label="Product Images (Up to 5)"
          accept="image/*"
          multiple={true}
          maxFiles={5}
          placeholder={<p>Drag and drop up to 5 images here, or click to select files</p>}
          helperText="Upload up to 5 product images (JPEG, PNG, GIF, WEBP formats)"
          parse={(value) => {
            // Return the value as is if it's not an array (e.g., when deleting)
            if (!Array.isArray(value)) return value;

            // For each file, ensure it has the correct structure
            return value.map(file => {
              // If it's already a processed file with src, keep it as is
              if (file.src) return file;

              // If it's a new file with rawFile, add title from originalname
              if (file.rawFile) {
                return {
                  ...file,
                  title: file.rawFile.name || 'Uploaded image'
                };
              }

              return file;
            });
          }}
        >
          <CustomImageField source="src" title="title" />
        </ImageInput>
      </SimpleForm>
    </div>
  </Edit>
);

// Create component for products
export const ProductCreate = (props) => (
  <Create {...props} mutationOptions={{ onSuccess: () => { window.location.href = '#/products'; } }}>
    <div style={{ height: '600px', overflow: 'scroll', padding: '34px', border: '1px solid #eee' }}>
      <SimpleForm
        toolbar={<CustomToolbar />}
        style={{
          marginBottom: '60px' // Space for the toolbar
        }}
      >
        {/* Required fields */}
        <TextInput 
          source="title" 
          validate={required()} 
          parse={(value) => InputValidation(value, "letter")} 
          helperText="Enter product title (letters and spaces only)"
        />
        <TextInput 
          source="shortDesc" 
          validate={required()} 
          multiline 
          helperText="Brief product description"
        />
        <TextInput 
          source="longDesc" 
          validate={required()} 
          multiline 
          helperText="Detailed product description"
        />
        <NumberInput 
          source="price" 
          validate={[required(), minValue(0)]} 
          helperText="Enter a positive value"
        />
        <NumberInput 
          source="stockQuantity" 
          label="Stock" 
          validate={[required(), minValue(0)]} 
          helperText="Enter available quantity"
        />
        {/* SKU is auto-generated on the backend */}
        <ReferenceInput source="categoryId" reference="categories">
          <SelectInput 
            optionText="name" 
            validate={required()} 
            helperText="Select a product category"
          />
        </ReferenceInput>

        {/* Hidden fields with defaults */}
        <BooleanInput source="isActive" defaultValue={true} style={{ display: 'none' }} />

        {/* Images */}
        <ImageInput
          source="file"
          label="Product Images (Up to 5)"
          accept="image/jpeg,image/png,image/gif,image/webp"
          multiple={true}
          maxFiles={5}
          placeholder={<p>Drag and drop up to 5 images here, or click to select files</p>}
          validate={[required()]}
          helperText="Upload up to 5 product images (JPEG, PNG, GIF, WEBP formats)"
          parse={(value) => {
            // Return the value as is if it's not an array (e.g., when deleting)
            if (!Array.isArray(value)) return value;

            // For each file, ensure it has the correct structure
            return value.map(file => {
              // If it's already a processed file with src, keep it as is
              if (file.src) return file;

              // If it's a new file with rawFile, add title from originalname
              if (file.rawFile) {
                return {
                  ...file,
                  title: file.rawFile.name || 'Uploaded image'
                };
              }

              return file;
            });
          }}
        >
          <CustomImageField source="src" title="title" />
        </ImageInput>
      </SimpleForm>
    </div>
  </Create>
);
