public class A {
    public static void ifElseMystery(int a, int b) {
        if (a % 10 == 0) {
            b *= 10;
            a += 10;
        } else {
            a %= 10;
        }

        if (a > b) {
            b = a;
        } else if (a == b) {
            b++;
        } else {
            a /= 10;
            b -= 10;
        }

        System.out.println(a + " " + b);
    }
}
