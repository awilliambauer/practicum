public class ifelse04 {
    public static void ifElseMystery(int a, int b) {
        if (a == b) {
            b--;
        } else if (a < b) {
            a++;
        } else {
            b = b + 5;
        }
        if (a == b) {
            a = a + 2;
        }
        System.out.println(a + " " + b);
    }
}
