import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './MainPage.css';
import AppHeader from '../components/AppHeader/AppHeader';
import FormField from '../components/FormField/FormField';
import Modal from '../components/Modal/Modal';
import ServiceCard from '../components/ServiceCard/ServiceCard';
import TopButton from '../components/TopButton/TopButton';
import { useAppContext } from '../context/AppContext';

function SubscriptionsPage() {
  const navigate = useNavigate();
  const { services, addService, startCheckout, isSubscribed } = useAppContext();
  const [selectedService, setSelectedService] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [formValues, setFormValues] = useState({ name: '', cost: '', image: '', description: '' });
  const [uploadName, setUploadName] = useState('');

  const handleFileChange = (event) => {
    const [file] = event.target.files || [];

    if (!file) {
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setFormValues((current) => ({ ...current, image: reader.result }));
      setUploadName(file.name);
    };
    reader.readAsDataURL(file);
  };

  const handleAddService = () => {
    const parsedCost = Number(formValues.cost);

    if (!formValues.name.trim() || !formValues.cost.trim() || Number.isNaN(parsedCost)) {
      return;
    }

    const newService = {
      id: `${formValues.name.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}`,
      name: formValues.name.trim(),
      cost: parsedCost,
      image: formValues.image,
      description: formValues.description.trim() || 'A custom subscription you added to the frontend prototype.',
    };

    addService(newService);
    setFormValues({ name: '', cost: '', image: '', description: '' });
    setUploadName('');
    setIsAddModalOpen(false);
  };

  const continueToPayment = () => {
    if (!selectedService) {
      return;
    }

    startCheckout(selectedService.id);
    setSelectedService(null);
    navigate('/payment');
  };

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
              <p className="page-subtitle">
                Each card is now reusable, fully frontend-driven, and ready for backend integration later.
              </p>
            </div>
            <div className="main-page__badge">{services.length} services visible</div>
          </div>

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
                price={service.cost}
                image={service.image}
                onClick={() => setSelectedService(service)}
              />
            ))}
          </div>
        </section>
      </div>

      {selectedService && (
        <Modal
          title={selectedService.name}
          onClose={() => setSelectedService(null)}
          footer={
            <div className="service-modal__actions">
              <TopButton onClick={() => navigate('/profile')}>View Profile</TopButton>
              <TopButton variant="primary" onClick={continueToPayment}>
                {isSubscribed(selectedService.id) ? 'Update Payment' : 'Continue to Payment'}
              </TopButton>
            </div>
          }
        >
          {selectedService.image ? (
            <img src={selectedService.image} alt="" className="service-modal__preview" />
          ) : null}
          <p className="service-modal__description">{selectedService.description}</p>
          <p className="service-modal__price">EUR {selectedService.cost.toFixed(2)} per month</p>
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
                placeholder="For example Hulu Duo"
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
