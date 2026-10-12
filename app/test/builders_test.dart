import 'package:flutter_test/flutter_test.dart';
import 'package:app/features/business/builders/domain/models/builder_project.dart';
import 'package:app/features/business/builders/domain/models/builder_group.dart';
import 'package:app/features/business/builders/domain/utils/builder_utils.dart';

void main() {
  group('BuilderUtils - Project Type Inference', () {
    test('explicit projectType takes precedence', () {
      expect(BuilderUtils.inferProjectTypeFromConfig('2 BHK Flat', projectType: 'villas'), 'villas');
      expect(BuilderUtils.inferProjectTypeFromConfig('Plots for sale', projectType: 'flats'), 'flats');
      expect(BuilderUtils.inferProjectTypeFromConfig('4 BHK Luxury', projectType: 'plots'), 'plots');
    });

    test('infers "flats" from configuration containing BHK or फ्लॅट', () {
      expect(BuilderUtils.inferProjectTypeFromConfig('2, 3 BHK Apartments'), 'flats');
      expect(BuilderUtils.inferProjectTypeFromConfig('1 BHK / 2 BHK लक्झरी'), 'flats');
      expect(BuilderUtils.inferProjectTypeFromConfig('भव्य फ्लॅट्स उपलब्ध'), 'flats');
      expect(BuilderUtils.inferProjectTypeFromConfig('3bhk premium'), 'flats');
    });

    test('infers "villas" from configuration containing villa, व्हिला, or बंगलो', () {
      expect(BuilderUtils.inferProjectTypeFromConfig('4 BHK Villa with Garden'), 'villas');
      expect(BuilderUtils.inferProjectTypeFromConfig('लक्झरी व्हिला संकुल'), 'villas');
      expect(BuilderUtils.inferProjectTypeFromConfig('रॉयल बंगलो प्लॉट्स'), 'villas');
      expect(BuilderUtils.inferProjectTypeFromConfig('Row House & Villas'), 'villas');
    });

    test('infers "plots" from configuration containing plot or प्लॉट', () {
      expect(BuilderUtils.inferProjectTypeFromConfig('Residential NA Plots'), 'plots');
      expect(BuilderUtils.inferProjectTypeFromConfig('एनए प्लॉटिंग प्रकल्प'), 'plots');
      expect(BuilderUtils.inferProjectTypeFromConfig('Commercial Plots'), 'plots');
    });

    test('returns null for unrecognized or empty configurations', () {
      expect(BuilderUtils.inferProjectTypeFromConfig(''), isNull);
      expect(BuilderUtils.inferProjectTypeFromConfig('Commercial Offices'), isNull);
      expect(BuilderUtils.inferProjectTypeFromConfig(null), isNull);
    });
  });

  group('BuilderUtils - Indian Phone Validation & Normalization', () {
    test('validates 10-digit Indian mobile numbers starting with 6-9', () {
      expect(BuilderUtils.isValidIndianPhone('9822012345'), isTrue);
      expect(BuilderUtils.isValidIndianPhone('8765432109'), isTrue);
      expect(BuilderUtils.isValidIndianPhone('7000000000'), isTrue);
      expect(BuilderUtils.isValidIndianPhone('6123456789'), isTrue);
    });

    test('validates numbers with +91, 91, and 0 prefixes', () {
      expect(BuilderUtils.isValidIndianPhone('+919822012345'), isTrue);
      expect(BuilderUtils.isValidIndianPhone('+91 98220 12345'), isTrue);
      expect(BuilderUtils.isValidIndianPhone('919822012345'), isTrue);
      expect(BuilderUtils.isValidIndianPhone('09822012345'), isTrue);
    });

    test('rejects invalid numbers', () {
      expect(BuilderUtils.isValidIndianPhone('5822012345'), isFalse); // starts with 5
      expect(BuilderUtils.isValidIndianPhone('1234567890'), isFalse); // starts with 1
      expect(BuilderUtils.isValidIndianPhone('982201234'), isFalse);  // 9 digits
      expect(BuilderUtils.isValidIndianPhone('98220123456'), isFalse); // 11 digits
      expect(BuilderUtils.isValidIndianPhone(''), isFalse);
      expect(BuilderUtils.isValidIndianPhone('abcdefghij'), isFalse);
    });

    test('normalizes phone number into 10-digit format', () {
      expect(BuilderUtils.normalizePhone('+91 98220 12345'), '9822012345');
      expect(BuilderUtils.normalizePhone('09822012345'), '9822012345');
      expect(BuilderUtils.normalizePhone('91-98220-12345'), '9822012345');
    });

    test('masks phone number without exposing private details', () {
      final masked = BuilderUtils.maskPhone('+91 9822012345');
      expect(masked, '98****2345');
      expect(masked.contains('9822012345'), isFalse);
    });
  });

  group('BuilderProject - Defensive Parsing', () {
    test('parses complete JSON correctly', () {
      final json = {
        'id': 'b-101',
        'projectName': 'शिवाजी हाइट्स',
        'developer': 'पाटील डेव्हलपर्स',
        'location': 'बाणेर, पुणे',
        'city': 'पुणे',
        'configuration': '2 & 3 BHK',
        'priceRange': '₹६५ लाख - ₹१.२ कोटी',
        'phone': '9822012345',
        'reraApproved': true,
        'reraNumber': 'P52100012345',
        'discountForMembers': 'विशेष ५% सवलत',
        'flatsDelivered': 350,
        'amenities': ['क्लबहाऊस', 'स्विमिंग पूल', 'जिम'],
        'possessionDate': 'डिसेंबर २०२६',
        'projectType': 'flats',
        'ownerName': 'राजेश पाटील',
      };

      final project = BuilderProject.fromJson(json);
      expect(project.id, 'b-101');
      expect(project.projectName, 'शिवाजी हाइट्स');
      expect(project.developer, 'पाटील डेव्हलपर्स');
      expect(project.location, 'बाणेर, पुणे');
      expect(project.city, 'पुणे');
      expect(project.reraApproved, isTrue);
      expect(project.reraNumber, 'P52100012345');
      expect(project.hasVerifiedRera, isTrue);
      expect(project.flatsDelivered, 350);
      expect(project.amenities.length, 3);
      expect(project.projectType, 'flats');
    });

    test('handles missing, null and malformed fields gracefully', () {
      final json = {
        'id': 102, // non-string id
        'projectName': null,
        'developer': null,
        'location': null,
        'configuration': null,
        'priceRange': null,
        'phone': null,
        'reraApproved': 'true', // string instead of bool
        'reraNumber': null,
        'amenities': 'क्लबहाऊस, गार्डन, जिम', // comma-separated string
        'flatsDelivered': '250', // string number
      };

      final project = BuilderProject.fromJson(json);
      expect(project.id, '102');
      expect(project.projectName, isNull);
      expect(project.developer, isNull);
      expect(project.hasVerifiedRera, isFalse); // reraNumber is null
      expect(project.flatsDelivered, 250);
      expect(project.amenities, ['क्लबहाऊस', 'गार्डन', 'जिम']);
    });
  });

  group('BuilderGroup - Grouping Logic', () {
    test('groups multiple projects by developer and aggregates details', () {
      final projects = [
        BuilderProject(
          id: 'p-1',
          projectName: 'यश हाइट्स',
          developer: 'देशमुख बिल्डर्स',
          location: 'कोथरूड, पुणे',
          configuration: '2 BHK',
          priceRange: '₹८० लाख',
          phone: '9822011111',
          reraApproved: true,
          reraNumber: 'P52100099999',
          city: 'पुणे',
          ownerName: 'आनंदराव देशमुख',
          flatsDelivered: 500,
          amenities: ['गार्डन', 'क्लबहाऊस'],
          discountForMembers: 'मराठा महासंघ सदस्यांसाठी ३% सवलत',
        ),
        BuilderProject(
          id: 'p-2',
          projectName: 'यश विस्टा',
          developer: 'देशमुख बिल्डर्स',
          location: 'वाकड, पुणे',
          configuration: '3 BHK Villa',
          priceRange: '₹१.५ कोटी',
          phone: '9822011111',
          city: 'पुणे',
          amenities: ['जिम', 'स्विमिंग पूल'],
        ),
        BuilderProject(
          id: 'p-3',
          projectName: 'सोनई पार्क',
          developer: 'कदम ग्रुप',
          location: 'सातारा',
          configuration: 'प्लॉट्स',
          priceRange: '₹२५ लाख',
          phone: '9822022222',
          city: 'सातारा',
          ownerName: 'विक्रम कदम',
        ),
      ];

      final groups = BuilderGroup.groupProjects(projects);
      expect(groups.length, 2);

      final deshmukhGroup = groups.firstWhere((g) => g.developer == 'देशमुख बिल्डर्स');
      expect(deshmukhGroup.projects.length, 2);
      expect(deshmukhGroup.ownerName, 'आनंदराव देशमुख');
      expect(deshmukhGroup.flatsDelivered, 500);
      expect(deshmukhGroup.discountForMembers, 'मराठा महासंघ सदस्यांसाठी ३% सवलत');
      expect(deshmukhGroup.hasRera, isTrue);
      expect(deshmukhGroup.primaryPhone, '9822011111');
      expect(deshmukhGroup.amenities, ['गार्डन', 'क्लबहाऊस']);

      final kadamGroup = groups.firstWhere((g) => g.developer == 'कदम ग्रुप');
      expect(kadamGroup.projects.length, 1);
      expect(kadamGroup.ownerName, 'विक्रम कदम');
      expect(kadamGroup.flatsDelivered, isNull);
      expect(kadamGroup.hasRera, isFalse);
    });

    test('RERA badge is active ONLY when reraApproved is true and reraNumber is present', () {
      final p1 = BuilderProject(
        id: '1',
        projectName: 'A',
        developer: 'Dev A',
        location: 'Pune',
        configuration: '2 BHK',
        priceRange: '₹50L',
        phone: '9822012345',
        reraApproved: true,
        reraNumber: null, // missing reraNumber
      );
      final p2 = BuilderProject(
        id: '2',
        projectName: 'B',
        developer: 'Dev B',
        location: 'Pune',
        configuration: '2 BHK',
        priceRange: '₹50L',
        phone: '9822012345',
        reraApproved: false,
        reraNumber: 'P52100012345', // not approved
      );
      final p3 = BuilderProject(
        id: '3',
        projectName: 'C',
        developer: 'Dev C',
        location: 'Pune',
        configuration: '2 BHK',
        priceRange: '₹50L',
        phone: '9822012345',
        reraApproved: true,
        reraNumber: 'P52100012345', // valid
      );

      final groupsA = BuilderGroup.groupProjects([p1]);
      final groupsB = BuilderGroup.groupProjects([p2]);
      final groupsC = BuilderGroup.groupProjects([p3]);

      expect(groupsA.first.hasRera, isFalse);
      expect(groupsB.first.hasRera, isFalse);
      expect(groupsC.first.hasRera, isTrue);
    });
  });
}
