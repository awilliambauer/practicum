
public class ifelse01 {

    public static void ifElseMystery2 (int x, int y) {
        int z = 4;

        if (z <= x) {
            z = x + 1;
        } else {
            z = z + 9;
        }

        if (z > y) {
            y++;
        } else if (z < y) {
            y = y - 3;
        } else {
            z = x + y + 7;
        }

        System.out.println (z + " " + y);

    }

}

