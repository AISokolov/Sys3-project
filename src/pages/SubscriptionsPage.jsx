import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import './SubscriptionsPage.css';
import AppHeader from '../components/AppHeader/AppHeader';
import Modal from '../components/Modal/Modal';
import ServiceCard from '../components/ServiceCard/ServiceCard';
import TopButton from '../components/TopButton/TopButton';
import FormField from '../components/FormField/FormField';
import notificationBell from '../assets/images/notification_bell.png';


function SubscriptionsPage() {
  const baseIp = import.meta.env.VITE_BASE_IP;
  const port = import.meta.env.VITE_BACKEND_PORT;
  const apiUrl = `http://${baseIp}:${port}`;

  const navigate = useNavigate();
  const [services, setServices] = useState([]);
  const [selectedService, setSelectedService] = useState(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [groupMode, setGroupMode] = useState('');
  const [groupName, setGroupName] = useState('');
  const [groupServiceLink, setGroupServiceLink] = useState('');
  const [availableGroups, setAvailableGroups] = useState([]);
  const [selectedGroupId, setSelectedGroupId] = useState('');
  const [groupMessage, setGroupMessage] = useState('');
  const [groupError, setGroupError] = useState('');
  const [isGroupSaving, setIsGroupSaving] = useState(false);
  const [isGroupsLoading, setIsGroupsLoading] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
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
        const response = await fetch(`${apiUrl}/services`);

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
    loadNotifications();
  }, []);

  async function loadNotifications() {
    try {
      const response = await fetch(`${apiUrl}/notifications`, {
        credentials: 'include',
      });

      if (response.status === 401) {
        navigate('/');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load notifications.');
      }

      const data = await response.json();
      setNotifications(data);
    } catch (error) {
      setNotifications([]);
    }
  }

  async function deleteNotification(notificationId) {
    try {
      const response = await fetch(`${apiUrl}/notifications/${notificationId}`, {
        method: 'DELETE',
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to delete notification.');
      }

      setNotifications((current) => current.filter((notification) => notification.id !== notificationId));
    } catch (error) {
      setGroupError('Could not delete notification.');
    }
  }

  function closeServiceModal() {
    setSelectedService(null);
    setGroupMode('');
    setGroupName('');
    setGroupServiceLink('');
    setAvailableGroups([]);
    setSelectedGroupId('');
    setGroupMessage('');
    setGroupError('');
    setIsGroupSaving(false);
    setIsGroupsLoading(false);
  }

  function openServiceModal(service) {
    setSelectedService(service);
    showJoinGroups(service);
  }

  function openCreateGroupForm() {
    setGroupMode('create');
    setSelectedGroupId('');
    setGroupError('');
    setGroupMessage('');
  }

  function getGroupMemberCount(group) {
    return group.memberCount || group.membersCount || group.currentMembers || 0;
  }

  function getGroupCapacity(group) {
    return group.capacity || 4;
  }

  function canJoinGroup(group) {
    return getGroupMemberCount(group) < getGroupCapacity(group) && !group.currentUserJoined;
  }

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
      const response = await fetch(`${apiUrl}/services`, {
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

  async function handleCreateGroup() {
    if (!selectedService || !groupName.trim() || !groupServiceLink.trim()) {
      setGroupError('Please write a group name and service link.');
      return;
    }

    try {
      setIsGroupSaving(true);
      setGroupError('');
      setGroupMessage('');

      const response = await fetch(`${apiUrl}/groups`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: groupName.trim(),
          serviceLink: groupServiceLink.trim(),
          typeId: selectedService.id,
        }),
      });

      if (response.status === 401) {
        navigate('/');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to create group.');
      }

      setGroupMessage('Group created. You can now see it in your profile.');
      setTimeout(() => navigate('/profile'), 700);
    } catch (error) {
      setGroupError('Could not create group yet. Check if POST /groups exists in the backend.');
    } finally {
      setIsGroupSaving(false);
    }
  }

  async function showJoinGroups(service) {
    const serviceToLoad = service || selectedService;

    if (!serviceToLoad) return;

    try {
      setGroupMode('join');
      setGroupError('');
      setGroupMessage('');
      setSelectedGroupId('');
      setIsGroupsLoading(true);

      const response = await fetch(`${apiUrl}/groups/service/${serviceToLoad.id}`, {
        credentials: 'include',
      });

      if (response.status === 401) {
        navigate('/');
        return;
      }

      if (!response.ok) {
        throw new Error('Failed to load groups.');
      }

      const data = await response.json();
      setAvailableGroups(data);
    } catch (error) {
      setAvailableGroups([]);
      setGroupError('Could not load groups yet. Check if GET /groups/service/:typeId exists in the backend.');
    } finally {
      setIsGroupsLoading(false);
    }
  }

  async function handleJoinGroup(groupId) {
    const groupIdToJoin = groupId || selectedGroupId;
    const selectedGroup = availableGroups.find((group) => String(group.id) === String(groupIdToJoin));

    if (!groupIdToJoin) {
      setGroupError('Please choose a group.');
      return;
    }

    navigate('/payment', {
      state: {
        paymentAction: 'join',
        groupId: groupIdToJoin,
        groupName: selectedGroup ? selectedGroup.name : '',
        serviceName: selectedService.name,
        serviceCost: selectedService.cost,
        serviceImage: selectedService.image,
      },
    });
  }

  return (
    <div>
      <AppHeader
        title="Available Subscriptions"
        actions={
          <>
            <div className="notifications-menu">
              <button
                type="button"
                className="notifications-button"
                onClick={() => setIsNotificationsOpen((current) => !current)}
                aria-label="Open notifications"
              >
                <img src={notificationBell} alt="" className="notifications-button__image" />
                {notifications.length > 0 ? (
                  <span className="notifications-button__count">{notifications.length}</span>
                ) : null}
              </button>

              {isNotificationsOpen ? (
                <div className="notifications-menu__panel">
                  <h3>Notifications</h3>
                  {notifications.length === 0 ? (
                    <p>No reminders right now.</p>
                  ) : (
                    notifications.map((notification) => (
                      <div className="notifications-menu__item" key={notification.id}>
                        <span>{notification.message}</span>
                        <button type="button" onClick={() => deleteNotification(notification.id)}>
                          Delete
                        </button>
                      </div>
                    ))
                  )}
                </div>
              ) : null}
            </div>
            <TopButton variant="primary" onClick={() => navigate('/profile')}>
              My Profile
            </TopButton>
          </>
        }
      />

      <div className="app-container page-content">
        <section className="section-card main-page__section">
          <div className="main-page__hero">
            <div>
              <h2 className="page-title">All subscriptions in one place</h2>
            </div>
            <div className="main-page__badge">{services.length} services available</div>
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
                  onClick={() => openServiceModal(service)}
                />
              ))}
            </div>
          )}
        </section>
      </div>

      {selectedService && (
        <Modal
          title={selectedService.name}
          onClose={closeServiceModal}
          footer={
            <div className="service-modal__actions">
              <TopButton onClick={closeServiceModal}>Close</TopButton>
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

          <div className="group-choice">
            <h3>What do you want to do?</h3>
            <div className="group-choice__buttons">
              <TopButton variant={groupMode === 'create' ? 'primary' : 'default'} onClick={openCreateGroupForm}>
                Create New Group
              </TopButton>
              <TopButton variant={groupMode === 'join' ? 'primary' : 'default'} onClick={() => showJoinGroups(selectedService)}>
                Join Existing Group
              </TopButton>
            </div>
          </div>

          {groupMode === 'create' ? (
            <div className="group-form">
              <FormField label="Group name" hint="Example: Netflix roommates or Spotify family">
                <input
                  value={groupName}
                  onChange={(event) => setGroupName(event.target.value)}
                  placeholder="My subscription group"
                />
              </FormField>
              <FormField label="Service link" hint="Paste the invite or family link for this service.">
                <input
                  value={groupServiceLink}
                  onChange={(event) => setGroupServiceLink(event.target.value)}
                  placeholder="https://example.com/join-family"
                />
              </FormField>
              <TopButton variant="primary" onClick={handleCreateGroup} disabled={isGroupSaving}>
                {isGroupSaving ? 'Creating...' : 'Create Group'}
              </TopButton>
            </div>
          ) : null}

          {groupMode === 'join' ? (
            <div className="group-form">
              <h4 className="group-form__title">Groups for {selectedService.name}</h4>
              {isGroupsLoading ? <p className="group-form__text">Loading groups...</p> : null}
              {!isGroupsLoading && availableGroups.length === 0 ? (
                <p className="group-form__text">No open groups for this service yet. You can create a new one.</p>
              ) : null}
              {!isGroupsLoading && availableGroups.length > 0 ? (
                <div className="group-list">
                  {availableGroups.map((group) => {
                    const memberCount = getGroupMemberCount(group);
                    const capacity = getGroupCapacity(group);
                    const isFull = memberCount >= capacity;
                    const isAlreadyJoined = group.currentUserJoined;
                    const canJoin = canJoinGroup(group);

                    return (
                      <button
                        type="button"
                        className={`group-list__item ${selectedGroupId === String(group.id) ? 'group-list__item--selected' : ''}`}
                        key={group.id}
                        onClick={() => setSelectedGroupId(String(group.id))}
                        disabled={!canJoin}
                      >
                        <span>
                          <strong>{group.name}</strong>
                          <small>
                            {isAlreadyJoined ? 'You are already in this group' : isFull ? 'Full group' : 'Available to join'}
                          </small>
                        </span>
                        <span className="group-list__capacity">
                          {memberCount}/{capacity}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ) : null}
              {!isGroupsLoading && availableGroups.some(canJoinGroup) ? (
                <TopButton variant="primary" onClick={() => handleJoinGroup(selectedGroupId)} disabled={isGroupSaving || !selectedGroupId}>
                  {isGroupSaving ? 'Joining...' : 'Join Group'}
                </TopButton>
              ) : null}
              {!isGroupsLoading && !availableGroups.some(canJoinGroup) ? (
                <TopButton variant="primary" onClick={openCreateGroupForm}>
                  Create New Group
                </TopButton>
              ) : null}
            </div>
          ) : null}

          {groupMessage ? <p className="group-message group-message--success">{groupMessage}</p> : null}
          {groupError ? <p className="group-message group-message--error">{groupError}</p> : null}
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
