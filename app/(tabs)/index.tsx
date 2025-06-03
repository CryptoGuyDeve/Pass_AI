const getCredentialIcon = (type: string) => {
  switch (type) {
    case 'password':
      return 'key';
    case 'creditCard':
      return 'card';
    case 'note':
      return 'document-text';
    case 'wifi':
      return 'wifi';
    case 'link':
      return 'link';
    case 'image':
      return 'image';
    default:
      return 'lock-closed';
  }
}; 