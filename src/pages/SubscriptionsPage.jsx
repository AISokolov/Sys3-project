import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SubscriptionsPage.css';
import AppHeader from '../components/AppHeader/AppHeader';
import Modal from '../components/Modal/Modal';
import ServiceCard from '../components/ServiceCard/ServiceCard';
import TopButton from '../components/TopButton/TopButton';
import FormField from '../components/FormField/FormField';


function SubscriptionsPage() {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formValues, setFormValues] = useState({
    name: '',
    cost: '',
    description: '',
    image: '',
  });
  const [uploadName, setUploadName] = useState('');

  useEffect(() => {
    async function fetchServices() {
      try {
        const response = await fetch('http://localhost:3001/services');

        if (!response.ok) {
          throw new Error('Failed to fetch services.');
        }

        const data = await response.json();
        setServices(data);
      } catch (error) {
        console.error('Failed to load services:', error);
        setServices([]);
      }
    }

    fetchServices();
  }, []);

  function handleFileChange(event) {
    const file = event.target.files[0];

    if (!file) return;

    const reader = new FileReader();

    reader.onload = () => {
      setFormValues((current) => ({
        ...current,
        image: reader.result,
      }));
      setUploadName(file.name);
    };

    reader.readAsDataURL(file);
  }

  async function handleAddService() {
    if (!formValues.name.trim() || !formValues.cost.trim()) {
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/services', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formValues.name,
          description: formValues.description.trim() || null,
          icon: formValues.image ? formValues.image.split(',')[1] : null,
          cost: formValues.cost
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to add service.');
      }

      const newService = await response.json();
      setServices((current) => [newService, ...current]);
      setFormValues({
        name: '',
        cost: '',
        description: '',
        image: '',
      });
      setUploadName('');
      setIsAddModalOpen(false);
    } catch (error) {
      console.error('Failed to add service:', error);
    }
  }

  return (
    <div>
      <AppHeader
        title="Available Subscriptions"
        actions={
          <TopButton variant="primary" onClick={() => navigate('/profile')}>
            My Profile
          </TopButton>
        }
      />

      <div className="app-container page-content">
        <section className="section-card main-page__section">
          <div className="main-page__hero">
            <div>
              <h2 className="page-title">All subscriptions in one place</h2>
            </div>
            <div className="main-page__badge">{services.length} services visible</div>
          </div>
          {services.length === 0 ? (
            <p className="page-subtitle">No services found.</p>
          ) : (
            <div className="main-page__grid">
              <ServiceCard
                title="Add a Service"
                caption="Upload an image and set the price"
                isAddCard
                onClick={() => setIsAddModalOpen(true)}
              />
              {services.map((service) => (
                <ServiceCard
                  key={service.id}
                  title={service.name}
                  price={Number(service.cost)}
                  image={service.image}
                  onClick={() => setSelectedService(service)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedService && (
        <Modal
          title={selectedService.name}
          onClose={() => setSelectedService(null)}
          footer={
            <div className="service-modal__actions">
              <TopButton onClick={() => setSelectedService(null)}>Close</TopButton>
              <TopButton variant="primary" onClick={() => navigate('/payment')}>
                Continue
              </TopButton>
            </div>
          }
        >
          {selectedService.image ? (
            <img src={selectedService.image} alt={selectedService.name} className="service-modal__preview" />
          ) : null}
          {selectedService.description ? (
            <p className="service-modal__description">{selectedService.description}</p>
          ) : null}
          <p className="service-modal__price">EUR {selectedService.cost} per month</p>
        </Modal>
      )}

      {isAddModalOpen && (
        <Modal
          title="Add a new service"
          onClose={() => setIsAddModalOpen(false)}
          footer={<TopButton variant="primary" onClick={handleAddService}>Save Service</TopButton>}
        >
          <div className="modal-form">
            <FormField label="Service name">
              <input
                value={formValues.name}
                onChange={(event) => setFormValues((current) => ({ ...current, name: event.target.value }))}
                placeholder="Spotify, Netflix, etc."
              />
            </FormField>
            <FormField label="Cost">
              <input
                type="number"
                min="0"
                step="0.01"
                value={formValues.cost}
                onChange={(event) => setFormValues((current) => ({ ...current, cost: event.target.value }))}
                placeholder="0.00"
              />
            </FormField>
            <FormField label="Description">
              <textarea
                value={formValues.description}
                onChange={(event) => setFormValues((current) => ({ ...current, description: event.target.value }))}
                placeholder="Short note about this service"
              />
            </FormField>
            <FormField label="Image" hint="Choose any logo or service image from your computer.">
              <input type="file" accept="image/*" onChange={handleFileChange} />
            </FormField>
            {formValues.image ? (
              <div className="upload-preview">
                <img src={formValues.image} alt="" />
                <div>
                  <strong>{uploadName || 'Uploaded image'}</strong>
                </div>
              </div>
            ) : null}
          </div>
        </Modal>
      )}

    </div>
  );
}

export default SubscriptionsPage;
