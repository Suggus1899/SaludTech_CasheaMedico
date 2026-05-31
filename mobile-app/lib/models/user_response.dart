class UserResponse {
  final String id;
  final String email;
  final String firstName;
  final String lastName;
  final int level;
  final int points;

  UserResponse({
    required this.id,
    required this.email,
    required this.firstName,
    required this.lastName,
    required this.level,
    this.points = 0,
  });

  factory UserResponse.fromJson(Map<String, dynamic> json) {
    return UserResponse(
      id: json['id'],
      email: json['email'],
      firstName: json['firstName'],
      lastName: json['lastName'],
      level: json['level'] ?? 1,
      points: json['points'] ?? 0,
    );
  }
}
