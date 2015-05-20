public class ifelse05 {
    public static void ifElseMystery(int a, int b) {
        if (a * 2 < b) {
            a = a * 3;
        }
        if (b < a) {
            b++;
        } else {
            a--;
        }
        System.out.println(a + " " + b);
    }
}
