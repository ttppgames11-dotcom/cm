import 'package:app/widgets/home/website_home_extras.dart';
import 'package:flutter_test/flutter_test.dart';

void main() {
  test('shows the event on its own date', () {
    final t = todayInHistory(DateTime(2026, 6, 6));
    expect(t.isToday, isTrue);
    expect(t.date, '६ जून १६७४');
  });

  test('otherwise shows the next date coming up', () {
    final t = todayInHistory(DateTime(2026, 6, 7)); // after 6 June
    expect(t.isToday, isFalse);
    expect(t.date, '१३ जुलै १६६०');
  });

  test('wraps to the first date of the year after the last one', () {
    final t = todayInHistory(DateTime(2026, 12, 31));
    expect(t.isToday, isFalse);
    expect(t.date, '४ फेब्रुवारी १६७०');
  });
}
