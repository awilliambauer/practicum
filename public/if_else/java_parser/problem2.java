public class A {
    public static void ifElseMystery2 (int x, int y) {
        int z = 2;

        if (z < x) {
            x = x + 12;
        }

        if (z + y > x) {
            y = y + 5;
            x = x * 2;
        }

        if (y > x) {
            z = z + y;
        }

        System.out.println(x + " " + y + " " + z);
    }
}
