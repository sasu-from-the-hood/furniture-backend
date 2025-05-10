import { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  TextField,
  Button,
  Divider,
  CircularProgress,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions
} from '@mui/material';
import { Add as AddIcon, Delete as DeleteIcon, Edit as EditIcon } from '@mui/icons-material';
import { useDataProvider, useNotify, Title } from 'react-admin';
import { API_URL, getAuthHeaders } from '../../config';

const SiteSettingsPage = () => {
  const dataProvider = useDataProvider();
  const notify = useNotify();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [settings, setSettings] = useState({
    // General settings
    site_name: 'Furniture Catalog',
    site_description: 'Quality furniture for your home',
    site_logo: '',
    site_favicon: '',

    // Contact settings
    contact_email: '',
    contact_phone: '',
    contact_address: '',

    // Social settings
    social_facebook: '',
    social_instagram: '',

    // Home settings
    hero_title: 'Elegant Furniture for Modern Living',
    hero_subtitle: 'Transform your space with our exclusive collection',
    why_choose_us_title: 'Why Choose Us?',
    why_choose_us_reasons: [],
    video_url: '',
    testimonials: []
  });

  // Dialog state for reasons and testimonials
  const [openReasonDialog, setOpenReasonDialog] = useState(false);
  const [openTestimonialDialog, setOpenTestimonialDialog] = useState(false);
  const [currentReason, setCurrentReason] = useState({ title: '', description: '' });
  const [currentTestimonial, setCurrentTestimonial] = useState({ author: '', quote: '' });
  const [editIndex, setEditIndex] = useState(-1);

  // Load settings when component mounts
  useEffect(() => {
    fetchSettings();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      // First try using the dataProvider
      try {
        const { data } = await dataProvider.customQuery({
          type: 'GET_ONE',
          resource: 'settings',
          payload: { id: 'basic' }
        });

        if (data && data.flatSettings) {
          setSettings(data.flatSettings);
          return;
        } else if (data) {
          // Fallback if flatSettings is not available
          setSettings({
            site_name: data.site_name || 'Furniture Catalog',
            site_description: data.site_description || 'Quality furniture for your home',
            site_logo: data.site_logo || '',
            site_favicon: data.site_favicon || '',
            contact_email: data.contact_email || '',
            contact_phone: data.contact_phone || '',
            contact_address: data.contact_address || '',
            social_facebook: data.social_facebook || '',
            social_instagram: data.social_instagram || '',
            hero_title: data.hero_title || 'Elegant Furniture for Modern Living',
            hero_subtitle: data.hero_subtitle || 'Transform your space with our exclusive collection',
            why_choose_us_title: data.why_choose_us_title || 'Why Choose Us?',
            why_choose_us_reasons: data.why_choose_us_reasons || [],
            video_url: data.video_url || '',
            testimonials: data.testimonials || []
          });
          return;
        }
      } catch (dataProviderError) {
        console.log('DataProvider failed, falling back to direct API call', dataProviderError);
      }

      // Fallback to direct API call if dataProvider fails
      const response = await fetch(`${API_URL}/settings/basic`, {
        method: 'GET',
        headers: getAuthHeaders()
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();

      if (data && data.flatSettings) {
        setSettings(data.flatSettings);
      } else if (data) {
        setSettings({
          site_name: data.site_name || 'Furniture Catalog',
          site_description: data.site_description || 'Quality furniture for your home',
          site_logo: data.site_logo || '',
          site_favicon: data.site_favicon || '',
          contact_email: data.contact_email || '',
          contact_phone: data.contact_phone || '',
          contact_address: data.contact_address || '',
          social_facebook: data.social_facebook || '',
          social_instagram: data.social_instagram || '',
          hero_title: data.hero_title || 'Elegant Furniture for Modern Living',
          hero_subtitle: data.hero_subtitle || 'Transform your space with our exclusive collection',
          why_choose_us_title: data.why_choose_us_title || 'Why Choose Us?',
          why_choose_us_reasons: data.why_choose_us_reasons || [],
          video_url: data.video_url || '',
          testimonials: data.testimonials || []
        });
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      notify('Failed to load settings', { type: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setSettings(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // First try using the dataProvider
      try {
        await dataProvider.customQuery({
          type: 'POST_ONE',
          resource: 'settings',
          payload: {
            id: 'basic',
            data: settings
          }
        });

        notify('Settings updated successfully', { type: 'success' });
        return;
      } catch (dataProviderError) {
        console.log('DataProvider failed, falling back to direct API call', dataProviderError);
      }

      // Fallback to direct API call if dataProvider fails
      const response = await fetch(`${API_URL}/settings/basic`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(settings)
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      notify('Settings updated successfully', { type: 'success' });
    } catch (error) {
      console.error('Error updating settings:', error);
      notify('Failed to update settings', { type: 'error' });
    } finally {
      setSaving(false);
    }
  };

  // Reason dialog handlers
  const handleOpenReasonDialog = (index = -1) => {
    if (index >= 0) {
      setCurrentReason({
        title: settings.why_choose_us_reasons[index].title || '',
        description: settings.why_choose_us_reasons[index].description || ''
      });
      setEditIndex(index);
    } else {
      setCurrentReason({ title: '', description: '' });
      setEditIndex(-1);
    }
    setOpenReasonDialog(true);
  };

  const handleCloseReasonDialog = () => {
    setOpenReasonDialog(false);
    setCurrentReason({ title: '', description: '' });
    setEditIndex(-1);
  };

  const handleReasonChange = (e) => {
    const { name, value } = e.target;
    setCurrentReason(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveReason = () => {
    const updatedReasons = [...settings.why_choose_us_reasons];

    if (editIndex >= 0) {
      updatedReasons[editIndex] = currentReason;
    } else {
      updatedReasons.push(currentReason);
    }

    setSettings(prev => ({
      ...prev,
      why_choose_us_reasons: updatedReasons
    }));

    handleCloseReasonDialog();
  };

  const handleDeleteReason = (index) => {
    const updatedReasons = [...settings.why_choose_us_reasons];
    updatedReasons.splice(index, 1);

    setSettings(prev => ({
      ...prev,
      why_choose_us_reasons: updatedReasons
    }));
  };

  // Testimonial dialog handlers
  const handleOpenTestimonialDialog = (index = -1) => {
    if (index >= 0) {
      setCurrentTestimonial({
        author: settings.testimonials[index].author || '',
        quote: settings.testimonials[index].quote || ''
      });
      setEditIndex(index);
    } else {
      setCurrentTestimonial({ author: '', quote: '' });
      setEditIndex(-1);
    }
    setOpenTestimonialDialog(true);
  };

  const handleCloseTestimonialDialog = () => {
    setOpenTestimonialDialog(false);
    setCurrentTestimonial({ author: '', quote: '' });
    setEditIndex(-1);
  };

  const handleTestimonialChange = (e) => {
    const { name, value } = e.target;
    setCurrentTestimonial(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSaveTestimonial = () => {
    const updatedTestimonials = [...settings.testimonials];

    if (editIndex >= 0) {
      updatedTestimonials[editIndex] = currentTestimonial;
    } else {
      updatedTestimonials.push(currentTestimonial);
    }

    setSettings(prev => ({
      ...prev,
      testimonials: updatedTestimonials
    }));

    handleCloseTestimonialDialog();
  };

  const handleDeleteTestimonial = (index) => {
    const updatedTestimonials = [...settings.testimonials];
    updatedTestimonials.splice(index, 1);

    setSettings(prev => ({
      ...prev,
      testimonials: updatedTestimonials
    }));
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ p: 2, maxWidth: '100%' }}>
      <Title title="Site Settings" />

      <Typography variant="h4" component="h1" gutterBottom>
        Site Settings
      </Typography>

      <Typography variant="body1" gutterBottom>
        Manage your site&apos;s general information, contact details, social media links, and home page content.
      </Typography>

      <Card sx={{ mt: 3, maxHeight: 'calc(100vh - 150px)', overflow: 'auto' }}>
        <CardContent>
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* General Settings */}
            <Typography variant="h6" gutterBottom>General Settings</Typography>
            <Divider sx={{ mb: 2 }} />

            <TextField
              fullWidth
              label="Site Name"
              name="site_name"
              value={settings.site_name}
              onChange={handleInputChange}
              required
            />

            <TextField
              fullWidth
              label="Site Description"
              name="site_description"
              value={settings.site_description}
              onChange={handleInputChange}
              multiline
              rows={2}
              required
            />

            {/* <TextField
              fullWidth
              label="Site Logo URL"
              name="site_logo"
              value={settings.site_logo}
              onChange={handleInputChange}
              helperText="Enter the URL for your site logo"
            />

            <TextField
              fullWidth
              label="Site Favicon URL"
              name="site_favicon"
              value={settings.site_favicon}
              onChange={handleInputChange}
              helperText="Enter the URL for your site favicon"
            /> */}

            {/* Contact Settings */}
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Contact Settings</Typography>
            <Divider sx={{ mb: 2 }} />

            <TextField
              fullWidth
              label="Contact Email"
              name="contact_email"
              value={settings.contact_email}
              onChange={handleInputChange}
              type="email"
            />

            <TextField
              fullWidth
              label="Contact Phone"
              name="contact_phone"
              value={settings.contact_phone}
              onChange={handleInputChange}
            />

            <TextField
              fullWidth
              label="Contact Address"
              name="contact_address"
              value={settings.contact_address}
              onChange={handleInputChange}
              multiline
              rows={2}
            />

            {/* Social Settings */}
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Social Media Settings</Typography>
            <Divider sx={{ mb: 2 }} />

            <TextField
              fullWidth
              label="Facebook URL"
              name="social_facebook"
              value={settings.social_facebook}
              onChange={handleInputChange}
            />

            <TextField
              fullWidth
              label="Instagram URL"
              name="social_instagram"
              value={settings.social_instagram}
              onChange={handleInputChange}
            />

            {/* Home Settings */}
            <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Home Page Settings</Typography>
            <Divider sx={{ mb: 2 }} />

            {/* Hero Section */}
            <Typography variant="subtitle1">Hero Section</Typography>

            <TextField
              fullWidth
              label="Hero Title"
              name="hero_title"
              value={settings.hero_title}
              onChange={handleInputChange}
              required
            />

            <TextField
              fullWidth
              label="Hero Subtitle"
              name="hero_subtitle"
              value={settings.hero_subtitle}
              onChange={handleInputChange}
              multiline
              rows={2}
              required
            />

            <TextField
              fullWidth
              label="Video URL"
              name="video_url"
              value={settings.video_url}
              onChange={handleInputChange}
              helperText="Enter a YouTube or Vimeo URL"
            />

            {/* Why Choose Us Section */}
            <Typography variant="subtitle1" sx={{ mt: 2 }}>Why Choose Us Section</Typography>

            {/* <TextField
              fullWidth
              label="Why Choose Us Title"
              name="why_choose_us_title"
              value={settings.why_choose_us_title}
              onChange={handleInputChange}
              required
            /> */}

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2">Reasons</Typography>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                size="small"
                onClick={() => handleOpenReasonDialog()}
              >
                Add Reason
              </Button>
            </Box>

            <List sx={{ bgcolor: '#f5f5f5', borderRadius: '4px', mb: 0 }}>
              {settings.why_choose_us_reasons.map((reason, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <Box>
                      <IconButton edge="end" onClick={() => handleOpenReasonDialog(index)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDeleteReason(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={reason.title}
                    secondary={reason.description}
                  />
                </ListItem>
              ))}
              {settings.why_choose_us_reasons.length === 0 && (
                <ListItem>
                  <ListItemText primary="No reasons added yet" />
                </ListItem>
              )}
            </List>

            {/* Testimonials Section */}
            <Typography variant="subtitle1" sx={{ mt: 2 }}>Testimonials Section</Typography>

            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2">Customer Testimonials</Typography>
              <Button
                startIcon={<AddIcon />}
                variant="outlined"
                size="small"
                onClick={() => handleOpenTestimonialDialog()}
              >
                Add Testimonial
              </Button>
            </Box>

            <List sx={{ bgcolor: '#f5f5f5', borderRadius: '4px', mb: 0 }}>
              {settings.testimonials.map((testimonial, index) => (
                <ListItem
                  key={index}
                  secondaryAction={
                    <Box>
                      <IconButton edge="end" onClick={() => handleOpenTestimonialDialog(index)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton edge="end" onClick={() => handleDeleteTestimonial(index)}>
                        <DeleteIcon />
                      </IconButton>
                    </Box>
                  }
                >
                  <ListItemText
                    primary={`${testimonial.author}`}
                    secondary={testimonial.quote}
                  />
                </ListItem>
              ))}
              {settings.testimonials.length === 0 && (
                <ListItem>
                  <ListItemText primary="No testimonials added yet" />
                </ListItem>
              )}
            </List>

            {/* Submit Button */}
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                disabled={saving}
                size="large"
              >
                {saving ? 'Saving...' : 'Save Settings'}
              </Button>
            </Box>
          </form>
        </CardContent>
      </Card>

      {/* Reason Dialog */}
      <Dialog open={openReasonDialog} onClose={handleCloseReasonDialog}>
        <DialogTitle>{editIndex >= 0 ? 'Edit Reason' : 'Add Reason'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="title"
            label="Title"
            fullWidth
            value={currentReason.title}
            onChange={handleReasonChange}
            required
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            fullWidth
            multiline
            rows={3}
            value={currentReason.description}
            onChange={handleReasonChange}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseReasonDialog}>Cancel</Button>
          <Button onClick={handleSaveReason} color="primary">Save</Button>
        </DialogActions>
      </Dialog>

      {/* Testimonial Dialog */}
      <Dialog open={openTestimonialDialog} onClose={handleCloseTestimonialDialog}>
        <DialogTitle>{editIndex >= 0 ? 'Edit Testimonial' : 'Add Testimonial'}</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="author"
            label="Customer Name"
            fullWidth
            value={currentTestimonial.author}
            onChange={handleTestimonialChange}
            required
          />
          <TextField
            margin="dense"
            name="quote"
            label="Testimonial Content"
            fullWidth
            multiline
            rows={3}
            value={currentTestimonial.quote}
            onChange={handleTestimonialChange}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTestimonialDialog}>Cancel</Button>
          <Button onClick={handleSaveTestimonial} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default SiteSettingsPage;
