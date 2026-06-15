class Address {
  final String id;
  final String fullName;
  final String phone;
  final String street;
  final String city;
  final String state;
  final String pincode;
  final String country;
  final bool isDefault;

  Address({
    required this.id,
    this.fullName = '',
    this.phone = '',
    this.street = '',
    this.city = '',
    this.state = '',
    this.pincode = '',
    this.country = 'India',
    this.isDefault = false,
  });

  String get formatted => '$street, $city, $state - $pincode';

  factory Address.fromJson(Map<String, dynamic> json) {
    return Address(
      id: json['_id'] ?? '',
      fullName: json['fullName'] ?? '',
      phone: json['phone'] ?? '',
      street: json['street'] ?? '',
      city: json['city'] ?? '',
      state: json['state'] ?? '',
      pincode: json['pincode'] ?? '',
      country: json['country'] ?? 'India',
      isDefault: json['isDefault'] ?? false,
    );
  }

  Map<String, dynamic> toJson() => {
    'fullName': fullName,
    'phone': phone,
    'street': street,
    'city': city,
    'state': state,
    'pincode': pincode,
    'country': country,
    'isDefault': isDefault,
  };
}
