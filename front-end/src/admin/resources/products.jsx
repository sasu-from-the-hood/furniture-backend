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
} from 'react-admin';

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

// List component for products
export const ProductList = (props) => (
  <List {...props} sort={{ field: 'createdAt', order: 'DESC' }}>
    <Datagrid>
      <TextField source="title" />
      <TextField source="shortDesc" />
      <NumberField source="price" options={{ style: 'currency', currency: 'USD' }} />
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
        <TextInput source="title" validate={required()} parse={(value) => InputValidation(value, "letter")} />
        <TextInput source="shortDesc" validate={required()} multiline />
        <TextInput source="longDesc" validate={required()} multiline />
        <NumberInput source="price" validate={[required(), minValue(0)]} />
        {/* SKU is auto-generated on the backend */}
        <ReferenceInput source="categoryId" reference="categories">
          <SelectInput optionText="name" validate={required()} />
        </ReferenceInput>

        {/* Hidden fields with defaults */}
        <BooleanInput source="isActive" defaultValue={true} style={{ display: 'none' }} />

        {/* Images */}
        <ImageInput
          source="file"
          label="Product Images"
          accept="image/*"
          placeholder={<p>Drag and drop an image here, or click to select a file</p>}
          validate={[required()]}
        >
          <ImageField source="src" title="title" />
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
        <TextInput source="title" validate={required()} parse={(value) => InputValidation(value, "letter")} />
        <TextInput source="shortDesc" validate={required()} multiline />
        <TextInput source="longDesc" validate={required()} multiline />
        <NumberInput source="price" validate={[required(), minValue(0)]} />
        {/* SKU is auto-generated on the backend */}
        <ReferenceInput source="categoryId" reference="categories">
          <SelectInput optionText="name" validate={required()} />
        </ReferenceInput>

        {/* Hidden fields with defaults */}
        <BooleanInput source="isActive" defaultValue={true} style={{ display: 'none' }} />

        {/* Images */}
        <ImageInput
          source="file"
          label="Product Images"
          accept="image/*"
          placeholder={<p>Drag and drop an image here, or click to select a file</p>}
          validate={[required()]}
        >
          <ImageField source="src" title="title" />
        </ImageInput>
      </SimpleForm>
    </div>
  </Create>
);
