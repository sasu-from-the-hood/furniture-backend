import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  TextField, 
  Button, 
  Grid, 
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
import { toast } from 'react-toastify';
import { API_URL, getAuthHeaders } from '../../config';

const SimpleSettingsForm = () => {
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
  const [currentReason, setCurrentReason] = useState({ title: '', description: '', icon: '' });
  const [currentTestimonial, setCurrentTestimonial] = useState({ name: '', position: '', content: '', rating: 5 });
  const [editIndex, setEditIndex] = useState(-1);

  // Load settings when component mounts
  useEffect(() => {
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/superadmin/settings/basic`);
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }
      
      const data = await response.json();
      if (data.flatSettings) {
        setSettings(data.flatSettings);
      }
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
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
      const response = await fetch(`${API_URL}/superadmin/settings/basic`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...getAuthHeaders()
        },
        body: JSON.stringify(settings)
      });
      
      if (!response.ok) {
        throw new Error('Failed to update settings');
      }
      
      toast.success('Settings updated successfully');
    } catch (error) {
      console.error('Error updating settings:', error);
      toast.error('Failed to update settings');
    } finally {
      setSaving(false);
    }
  };

  // Reason dialog handlers
  const handleOpenReasonDialog = (index = -1) => {
    if (index >= 0) {
      setCurrentReason(settings.why_choose_us_reasons[index]);
      setEditIndex(index);
    } else {
      setCurrentReason({ title: '', description: '', icon: '' });
      setEditIndex(-1);
    }
    setOpenReasonDialog(true);
  };

  const handleCloseReasonDialog = () => {
    setOpenReasonDialog(false);
    setCurrentReason({ title: '', description: '', icon: '' });
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
      setCurrentTestimonial(settings.testimonials[index]);
      setEditIndex(index);
    } else {
      setCurrentTestimonial({ name: '', position: '', content: '', rating: 5 });
      setEditIndex(-1);
    }
    setOpenTestimonialDialog(true);
  };

  const handleCloseTestimonialDialog = () => {
    setOpenTestimonialDialog(false);
    setCurrentTestimonial({ name: '', position: '', content: '', rating: 5 });
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
    <Card>
      <CardContent>
        <Typography variant="h5" gutterBottom>Site Settings</Typography>
        
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            {/* General Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>General Settings</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Site Name"
                name="site_name"
                value={settings.site_name}
                onChange={handleInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
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
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Site Logo URL"
                name="site_logo"
                value={settings.site_logo}
                onChange={handleInputChange}
                helperText="Enter the URL for your site logo"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Site Favicon URL"
                name="site_favicon"
                value={settings.site_favicon}
                onChange={handleInputChange}
                helperText="Enter the URL for your site favicon"
              />
            </Grid>

            {/* Contact Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Contact Settings</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Email"
                name="contact_email"
                value={settings.contact_email}
                onChange={handleInputChange}
                type="email"
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Contact Phone"
                name="contact_phone"
                value={settings.contact_phone}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Contact Address"
                name="contact_address"
                value={settings.contact_address}
                onChange={handleInputChange}
                multiline
                rows={2}
              />
            </Grid>

            {/* Social Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Social Media Settings</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Facebook URL"
                name="social_facebook"
                value={settings.social_facebook}
                onChange={handleInputChange}
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Instagram URL"
                name="social_instagram"
                value={settings.social_instagram}
                onChange={handleInputChange}
              />
            </Grid>

            {/* Home Settings */}
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>Home Page Settings</Typography>
              <Divider sx={{ mb: 2 }} />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Hero Title"
                name="hero_title"
                value={settings.hero_title}
                onChange={handleInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
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
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Why Choose Us Title"
                name="why_choose_us_title"
                value={settings.why_choose_us_title}
                onChange={handleInputChange}
                required
              />
            </Grid>
            
            <Grid item xs={12} md={6}>
              <TextField
                fullWidth
                label="Video URL"
                name="video_url"
                value={settings.video_url}
                onChange={handleInputChange}
                helperText="Enter a YouTube or Vimeo URL"
              />
            </Grid>

            {/* Why Choose Us Reasons */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">Why Choose Us Reasons</Typography>
                <Button 
                  startIcon={<AddIcon />} 
                  variant="outlined" 
                  size="small"
                  onClick={() => handleOpenReasonDialog()}
                >
                  Add Reason
                </Button>
              </Box>
              
              <List>
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
            </Grid>

            {/* Testimonials */}
            <Grid item xs={12}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle1">Testimonials</Typography>
                <Button 
                  startIcon={<AddIcon />} 
                  variant="outlined" 
                  size="small"
                  onClick={() => handleOpenTestimonialDialog()}
                >
                  Add Testimonial
                </Button>
              </Box>
              
              <List>
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
                      primary={`${testimonial.name} (${testimonial.position})`} 
                      secondary={testimonial.content}
                    />
                  </ListItem>
                ))}
                {settings.testimonials.length === 0 && (
                  <ListItem>
                    <ListItemText primary="No testimonials added yet" />
                  </ListItem>
                )}
              </List>
            </Grid>

            {/* Submit Button */}
            <Grid item xs={12}>
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
            </Grid>
          </Grid>
        </form>
      </CardContent>

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
          <TextField
            margin="dense"
            name="icon"
            label="Icon Class (optional)"
            fullWidth
            value={currentReason.icon}
            onChange={handleReasonChange}
            helperText="e.g., 'fa-star' for Font Awesome icons"
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
            name="name"
            label="Customer Name"
            fullWidth
            value={currentTestimonial.name}
            onChange={handleTestimonialChange}
            required
          />
          <TextField
            margin="dense"
            name="position"
            label="Position/Title"
            fullWidth
            value={currentTestimonial.position}
            onChange={handleTestimonialChange}
            required
          />
          <TextField
            margin="dense"
            name="content"
            label="Testimonial Content"
            fullWidth
            multiline
            rows={3}
            value={currentTestimonial.content}
            onChange={handleTestimonialChange}
            required
          />
          <TextField
            margin="dense"
            name="rating"
            label="Rating (1-5)"
            type="number"
            fullWidth
            value={currentTestimonial.rating}
            onChange={handleTestimonialChange}
            inputProps={{ min: 1, max: 5 }}
            required
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseTestimonialDialog}>Cancel</Button>
          <Button onClick={handleSaveTestimonial} color="primary">Save</Button>
        </DialogActions>
      </Dialog>
    </Card>
  );
};

export default SimpleSettingsForm;
