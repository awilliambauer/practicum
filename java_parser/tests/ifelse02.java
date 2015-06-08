public class ifelse02 {
    public static void ifElseMystery(int a, int b) {
        int c = 2;
        if (a + c < b) {
            c = c + 8;
        } else {
            b = b + 10;
        }
        if (a + c < b) {
            c = c + 8;
        } else {
            b = b + 10;
        }
        System.out.println(b + " " + c);
    }
}

